import AsyncStorage from '@react-native-async-storage/async-storage';
import { ApolloClient } from '@apollo/client';
import { networkService } from './networkService';
import { resolveConflict, ConflictStrategy, hasConflict } from './conflictResolution';
import { EventEmitter } from 'events';

// Mutation queue item interface
export interface MutationQueueItem {
  id: string;
  mutation: any; // The mutation document
  variables: any;
  optimisticResponse?: any;
  update?: any;
  context?: any;
  operationName: string;
  entityType: string;
  createdAt: number;
  retries: number;
}

// Queue events
export enum QueueEvents {
  ITEM_ADDED = 'item_added',
  ITEM_PROCESSED = 'item_processed',
  ITEM_FAILED = 'item_failed',
  QUEUE_PROCESSED = 'queue_processed',
  CONFLICT_DETECTED = 'conflict_detected',
}

// Offline queue service
class OfflineQueueService {
  private queue: MutationQueueItem[] = [];
  private isProcessing: boolean = false;
  private apolloClient: ApolloClient<any> | null = null;
  private maxRetries: number = 5;
  private storageKey: string = 'offline_mutation_queue';
  private networkListener: any = null;
  private eventEmitter: EventEmitter = new EventEmitter();
  private entityTypeMap: Record<string, string> = {
    UpdateProfile: 'profile',
    CreateProfile: 'profile',
    UpdateApplication: 'application',
    CreateApplication: 'application',
    UpdateJobAlert: 'jobAlert',
    CreateJobAlert: 'jobAlert',
    SaveJob: 'savedJob',
    UnsaveJob: 'savedJob',
    UpdateResume: 'resume',
    CreateResume: 'resume',
  };
  
  // Initialize the queue service
  async initialize(client: ApolloClient<any>) {
    this.apolloClient = client;
    await this.loadQueue();
    this.setupNetworkListener();
    console.log('Offline queue service initialized');
  }
  
  // Set up network listener
  private setupNetworkListener() {
    // Set up network listener
    networkService.addConnectivityListener(this.handleConnectivityChange);
    networkService.startMonitoring();
  }
  
  // Handle connectivity changes
  private handleConnectivityChange = (isConnected: boolean) => {
    if (isConnected && !this.isProcessing && this.queue.length > 0) {
      console.log('Network is back online, processing queue...');
      this.processQueue();
    }
  };
  
  // Load queue from storage
  private async loadQueue() {
    try {
      const queueData = await AsyncStorage.getItem(this.storageKey);
      if (queueData) {
        this.queue = JSON.parse(queueData);
        console.log(`Loaded ${this.queue.length} items from offline queue`);
      }
    } catch (error) {
      console.error('Error loading offline queue:', error);
    }
  }
  
  // Save queue to storage
  private async saveQueue() {
    try {
      await AsyncStorage.setItem(this.storageKey, JSON.stringify(this.queue));
    } catch (error) {
      console.error('Error saving offline queue:', error);
    }
  }
  
  // Add mutation to queue
  async addToQueue(
    mutation: any,
    variables: any,
    optimisticResponse?: any,
    update?: any,
    context?: any
  ): Promise<string> {
    // Extract operation name from the mutation document
    const operationName = mutation.definitions.find(
      (def: any) => def.kind === 'OperationDefinition'
    )?.name?.value || 'UnknownOperation';
    
    const id = Date.now().toString();
    const queueItem: MutationQueueItem = {
      id,
      mutation,
      variables,
      optimisticResponse,
      update,
      context,
      operationName,
      entityType: this.getEntityTypeForOperation(operationName),
      createdAt: Date.now(),
      retries: 0
    };
    
    this.queue.push(queueItem);
    await this.saveQueue();
    
    // Emit event
    this.eventEmitter.emit(QueueEvents.ITEM_ADDED, queueItem);
    
    // Try to process queue if online
    if (networkService.isNetworkConnected() && !this.isProcessing) {
      this.processQueue();
    }
    
    return id;
  }
  
  // Get entity type for operation
  private getEntityTypeForOperation(operationName: string): string {
    return this.entityTypeMap[operationName] || 'unknown';
  }
  
  // Process the queue
  async processQueue() {
    if (!this.apolloClient || this.isProcessing || this.queue.length === 0) {
      return;
    }
    
    this.isProcessing = true;
    
    try {
      // Check network status
      if (!networkService.isNetworkConnected()) {
        this.isProcessing = false;
        return;
      }
      
      console.log(`Processing offline queue: ${this.queue.length} items`);
      
      // Process each item in the queue
      const itemsToProcess = [...this.queue];
      for (const item of itemsToProcess) {
        try {
          const result = await this.apolloClient.mutate({
            mutation: item.mutation,
            variables: item.variables,
            optimisticResponse: item.optimisticResponse,
            update: item.update,
            context: item.context
          });
          
          // Handle potential conflicts
          if (result.data) {
            const conflictResolved = await this.handleConflictResolution(result.data, item);
            if (!conflictResolved) {
              // Skip to next item if conflict couldn't be resolved
              continue;
            }
          }
          
          // Remove successful item from queue
          this.queue = this.queue.filter(queueItem => queueItem.id !== item.id);
          await this.saveQueue();
          
          // Emit event
          this.eventEmitter.emit(QueueEvents.ITEM_PROCESSED, item);
          
          console.log(`Successfully processed offline mutation: ${item.id} (${item.operationName})`);
        } catch (error) {
          console.error(`Error processing offline mutation ${item.id} (${item.operationName}):`, error);
          
          // Emit event
          this.eventEmitter.emit(QueueEvents.ITEM_FAILED, { item, error });
          
          // Increment retry count
          const updatedItem = this.queue.find(queueItem => queueItem.id === item.id);
          if (updatedItem) {
            updatedItem.retries += 1;
            
            // Remove if max retries reached
            if (updatedItem.retries >= this.maxRetries) {
              console.log(`Removing offline mutation after ${this.maxRetries} failed attempts: ${item.id} (${item.operationName})`);
              this.queue = this.queue.filter(queueItem => queueItem.id !== item.id);
            }
            
            await this.saveQueue();
          }
        }
      }
      
      // Emit event when queue processing is complete
      this.eventEmitter.emit(QueueEvents.QUEUE_PROCESSED);
    } catch (error) {
      console.error('Error processing offline queue:', error);
    } finally {
      this.isProcessing = false;
    }
  }
  
  // Handle conflict resolution
  private async handleConflictResolution(serverData: any, item: MutationQueueItem): Promise<boolean> {
    try {
      // Get the entity type and data
      const entityType = item.entityType;
      const clientData = item.variables;
      
      // Extract server data based on operation name
      const serverEntityData = this.extractServerData(serverData, item.operationName);
      
      if (!serverEntityData) {
        return true; // No server data to compare, assume no conflict
      }
      
      // Check if there's a conflict
      if (hasConflict(clientData, serverEntityData)) {
        console.log(`Conflict detected for ${item.operationName}`);
        
        // Emit conflict event
        this.eventEmitter.emit(QueueEvents.CONFLICT_DETECTED, {
          item,
          serverData: serverEntityData,
          clientData
        });
        
        // Resolve the conflict
        const resolvedData = resolveConflict(entityType, clientData, serverEntityData);
        
        // If manual resolution is needed, return false to skip this item
        if (resolvedData._conflict) {
          console.log(`Manual conflict resolution needed for ${item.id}`);
          return false;
        }
        
        // If data was changed during resolution, update with resolved data
        if (JSON.stringify(serverEntityData) !== JSON.stringify(resolvedData)) {
          await this.apolloClient?.mutate({
            mutation: item.mutation,
            variables: resolvedData
          });
        }
      }
      
      return true;
    } catch (error) {
      console.error(`Error resolving conflict for ${item.operationName}:`, error);
      return false;
    }
  }
  
  // Extract server data based on operation name
  private extractServerData(serverData: any, operationName: string): any {
    // Different extraction logic based on operation type
    switch (operationName) {
      case 'UpdateProfile':
        return serverData.update_profiles?.returning[0];
      case 'UpdateApplication':
        return serverData.update_applications?.returning[0];
      case 'UpdateJobAlert':
        return serverData.update_job_alerts?.returning[0];
      case 'UpdateResume':
        return serverData.update_resumes?.returning[0];
      default:
        // For other operations, try to infer the data structure
        const key = Object.keys(serverData).find(k => k.includes('update_') || k.includes('insert_'));
        if (key && serverData[key]?.returning?.[0]) {
          return serverData[key].returning[0];
        }
        return null;
    }
  }
  
  // Get queue items
  getQueue(): MutationQueueItem[] {
    return [...this.queue];
  }
  
  // Get queue length
  getQueueLength(): number {
    return this.queue.length;
  }
  
  // Clear the queue
  async clearQueue(): Promise<void> {
    this.queue = [];
    await this.saveQueue();
  }
  
  // Remove item from queue
  async removeFromQueue(id: string): Promise<void> {
    this.queue = this.queue.filter(item => item.id !== id);
    await this.saveQueue();
  }
  
  // Add event listener
  addEventListener(event: QueueEvents, listener: (...args: any[]) => void): void {
    this.eventEmitter.on(event, listener);
  }
  
  // Remove event listener
  removeEventListener(event: QueueEvents, listener: (...args: any[]) => void): void {
    this.eventEmitter.off(event, listener);
  }
  
  // Clean up resources
  cleanup() {
    networkService.removeConnectivityListener(this.handleConnectivityChange);
    networkService.stopMonitoring();
    this.eventEmitter.removeAllListeners();
  }
}

// Export singleton instance
export const offlineQueue = new OfflineQueueService();

// Apollo link for offline mutations
export const createOfflineMutationLink = () => {
  return {
    request: async (operation, forward) => {
      // Only handle mutations
      if (operation.query.definitions.some(
        def => def.kind === 'OperationDefinition' && def.operation === 'mutation'
      )) {
        try {
          // Check network status
          if (!networkService.isNetworkConnected()) {
            console.log('Device is offline, queueing mutation:', operation.operationName);
            
            const id = await offlineQueue.addToQueue(
              operation.query,
              operation.variables,
              operation.getContext().optimisticResponse,
              operation.getContext().update,
              operation.getContext()
            );
            
            // Throw a specific error that can be handled by the UI
            throw new Error(`Mutation queued for offline execution: ${id}`);
          }
        } catch (error) {
          if (error.message && error.message.includes('Mutation queued for offline execution')) {
            throw error;
          }
          // For other errors, continue with the request
          console.warn('Error in offline mutation link:', error);
        }
      }
      
      return forward(operation);
    }
  };
};

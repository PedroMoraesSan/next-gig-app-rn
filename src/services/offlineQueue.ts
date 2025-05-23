import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { ApolloClient } from '@apollo/client';

// Mutation queue item interface
export interface MutationQueueItem {
  id: string;
  mutation: any; // The mutation document
  variables: any;
  optimisticResponse?: any;
  update?: any;
  context?: any;
  createdAt: number;
  retries: number;
}

// Offline queue service
class OfflineQueueService {
  private queue: MutationQueueItem[] = [];
  private isProcessing: boolean = false;
  private apolloClient: ApolloClient<any> | null = null;
  private maxRetries: number = 5;
  private storageKey: string = 'offline_mutation_queue';
  private networkListener: any = null;
  
  // Initialize the queue service
  async initialize(client: ApolloClient<any>) {
    this.apolloClient = client;
    await this.loadQueue();
    this.setupNetworkListener();
  }
  
  // Set up network listener
  private setupNetworkListener() {
    // Remove existing listener if any
    if (this.networkListener) {
      this.networkListener();
    }
    
    // Set up new listener
    this.networkListener = NetInfo.addEventListener(state => {
      if (state.isConnected && !this.isProcessing && this.queue.length > 0) {
        this.processQueue();
      }
    });
  }
  
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
    const id = Date.now().toString();
    const queueItem: MutationQueueItem = {
      id,
      mutation,
      variables,
      optimisticResponse,
      update,
      context,
      createdAt: Date.now(),
      retries: 0
    };
    
    this.queue.push(queueItem);
    await this.saveQueue();
    
    // Try to process queue if online
    const networkState = await NetInfo.fetch();
    if (networkState.isConnected && !this.isProcessing) {
      this.processQueue();
    }
    
    return id;
  }
  
  // Process the queue
  async processQueue() {
    if (!this.apolloClient || this.isProcessing || this.queue.length === 0) {
      return;
    }
    
    this.isProcessing = true;
    
    try {
      // Check network status
      const networkState = await NetInfo.fetch();
      if (!networkState.isConnected) {
        this.isProcessing = false;
        return;
      }
      
      console.log(`Processing offline queue: ${this.queue.length} items`);
      
      // Process each item in the queue
      const itemsToProcess = [...this.queue];
      for (const item of itemsToProcess) {
        try {
          await this.apolloClient.mutate({
            mutation: item.mutation,
            variables: item.variables,
            optimisticResponse: item.optimisticResponse,
            update: item.update,
            context: item.context
          });
          
          // Remove successful item from queue
          this.queue = this.queue.filter(queueItem => queueItem.id !== item.id);
          await this.saveQueue();
          
          console.log(`Successfully processed offline mutation: ${item.id}`);
        } catch (error) {
          console.error(`Error processing offline mutation ${item.id}:`, error);
          
          // Increment retry count
          const updatedItem = this.queue.find(queueItem => queueItem.id === item.id);
          if (updatedItem) {
            updatedItem.retries += 1;
            
            // Remove if max retries reached
            if (updatedItem.retries >= this.maxRetries) {
              console.log(`Removing offline mutation after ${this.maxRetries} failed attempts: ${item.id}`);
              this.queue = this.queue.filter(queueItem => queueItem.id !== item.id);
            }
            
            await this.saveQueue();
          }
        }
      }
    } catch (error) {
      console.error('Error processing offline queue:', error);
    } finally {
      this.isProcessing = false;
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
  
  // Clean up resources
  cleanup() {
    if (this.networkListener) {
      this.networkListener();
      this.networkListener = null;
    }
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
          const networkState = await NetInfo.fetch();
          
          // If offline, add to queue
          if (!networkState.isConnected) {
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

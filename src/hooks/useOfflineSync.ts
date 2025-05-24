import { useState, useEffect } from 'react';
import { offlineQueue, QueueEvents, MutationQueueItem } from '../services/offlineQueue';
import { useNetworkStatus } from './useNetworkStatus';

/**
 * Hook to manage offline synchronization state and conflicts
 * @returns Object containing sync status and conflict handling methods
 */
export const useOfflineSync = () => {
  const { isOnline } = useNetworkStatus();
  const [pendingOperations, setPendingOperations] = useState<MutationQueueItem[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [conflicts, setConflicts] = useState<any[]>([]);
  const [syncProgress, setSyncProgress] = useState(0);

  useEffect(() => {
    // Update pending operations
    const updatePendingOperations = () => {
      setPendingOperations(offlineQueue.getQueue());
    };

    // Handle queue events
    const handleItemAdded = () => {
      updatePendingOperations();
    };

    const handleItemProcessed = () => {
      updatePendingOperations();
      updateSyncProgress();
    };

    const handleQueueProcessed = () => {
      setIsSyncing(false);
      setSyncProgress(100);
    };

    const handleConflictDetected = (conflict: any) => {
      setConflicts(prev => [...prev, conflict]);
    };

    // Update sync progress
    const updateSyncProgress = () => {
      const totalItems = pendingOperations.length;
      if (totalItems === 0) {
        setSyncProgress(100);
        return;
      }

      const remainingItems = offlineQueue.getQueueLength();
      const processedItems = totalItems - remainingItems;
      const progress = Math.round((processedItems / totalItems) * 100);
      setSyncProgress(progress);
    };

    // Set up event listeners
    offlineQueue.addEventListener(QueueEvents.ITEM_ADDED, handleItemAdded);
    offlineQueue.addEventListener(QueueEvents.ITEM_PROCESSED, handleItemProcessed);
    offlineQueue.addEventListener(QueueEvents.QUEUE_PROCESSED, handleQueueProcessed);
    offlineQueue.addEventListener(QueueEvents.CONFLICT_DETECTED, handleConflictDetected);

    // Initial update
    updatePendingOperations();

    // Update syncing state when network status changes
    if (isOnline && pendingOperations.length > 0) {
      setIsSyncing(true);
    }

    // Clean up
    return () => {
      offlineQueue.removeEventListener(QueueEvents.ITEM_ADDED, handleItemAdded);
      offlineQueue.removeEventListener(QueueEvents.ITEM_PROCESSED, handleItemProcessed);
      offlineQueue.removeEventListener(QueueEvents.QUEUE_PROCESSED, handleQueueProcessed);
      offlineQueue.removeEventListener(QueueEvents.CONFLICT_DETECTED, handleConflictDetected);
    };
  }, [isOnline, pendingOperations.length]);

  /**
   * Resolve a conflict with the provided data
   */
  const resolveConflict = async (conflictId: string, resolvedData: Record<string, any>) => {
    // Find the conflict
    const conflict = conflicts.find(c => c.item.id === conflictId);
    if (!conflict) return;

    // Remove from conflicts list
    setConflicts(prev => prev.filter(c => c.item.id !== conflictId));

    // Update the mutation with resolved data
    try {
      // Create a new mutation with the resolved data
      await offlineQueue.removeFromQueue(conflictId);
      // In a real app, you would resubmit the mutation with resolved data
    } catch (error) {
      console.error('Error resolving conflict:', error);
    }
  };

  /**
   * Force sync the queue
   */
  const forceSync = () => {
    if (isOnline && !isSyncing && pendingOperations.length > 0) {
      setIsSyncing(true);
      offlineQueue.processQueue();
    }
  };

  return {
    pendingOperations,
    isSyncing,
    syncProgress,
    conflicts,
    resolveConflict,
    forceSync,
    hasPendingOperations: pendingOperations.length > 0,
    hasConflicts: conflicts.length > 0,
  };
};

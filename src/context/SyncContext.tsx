import React, { createContext, useContext, useState, useEffect } from 'react';
import { useOfflineSync } from '../hooks/useOfflineSync';
import ConflictResolutionModal from '../components/ConflictResolutionModal';

interface SyncContextType {
  isSyncing: boolean;
  hasPendingOperations: boolean;
  pendingCount: number;
  syncProgress: number;
  forceSync: () => void;
}

const SyncContext = createContext<SyncContextType>({
  isSyncing: false,
  hasPendingOperations: false,
  pendingCount: 0,
  syncProgress: 0,
  forceSync: () => {},
});

/**
 * Provider component for sync status and conflict resolution
 */
export const SyncProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const {
    isSyncing,
    pendingOperations,
    syncProgress,
    conflicts,
    resolveConflict,
    forceSync,
    hasPendingOperations,
  } = useOfflineSync();

  // State for conflict resolution modal
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentConflict, setCurrentConflict] = useState<any>(null);

  // Show conflict resolution modal when conflicts are detected
  useEffect(() => {
    if (conflicts.length > 0 && !currentConflict) {
      setCurrentConflict(conflicts[0]);
      setIsModalVisible(true);
    } else if (conflicts.length === 0) {
      setCurrentConflict(null);
      setIsModalVisible(false);
    }
  }, [conflicts, currentConflict]);

  // Handle conflict resolution
  const handleResolveConflict = (resolvedData: Record<string, any>) => {
    if (currentConflict) {
      resolveConflict(currentConflict.item.id, resolvedData);
      setCurrentConflict(null);
    }
  };

  // Handle modal close
  const handleCloseModal = () => {
    setIsModalVisible(false);
    // We'll keep the current conflict in state
    // This way we won't show the same conflict again until user takes action
  };

  return (
    <SyncContext.Provider
      value={{
        isSyncing,
        hasPendingOperations,
        pendingCount: pendingOperations.length,
        syncProgress,
        forceSync,
      }}
    >
      {children}

      {/* Conflict Resolution Modal */}
      {currentConflict && (
        <ConflictResolutionModal
          visible={isModalVisible}
          onClose={handleCloseModal}
          onResolve={handleResolveConflict}
          clientData={currentConflict.clientData}
          serverData={currentConflict.serverData}
          entityType={currentConflict.item.entityType}
        />
      )}
    </SyncContext.Provider>
  );
};

/**
 * Hook to use sync context
 */
export const useSyncStatus = () => useContext(SyncContext);

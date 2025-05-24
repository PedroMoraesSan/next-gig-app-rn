import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { useSyncStatus } from '../context/SyncContext';
import Icon from 'react-native-vector-icons/MaterialIcons';

/**
 * Component to display offline status and sync information
 */
const OfflineNotice: React.FC = () => {
  const { isOnline } = useNetworkStatus();
  const { hasPendingOperations, pendingCount, isSyncing, syncProgress, forceSync } = useSyncStatus();

  // Don't show anything if online and no pending operations
  if (isOnline && !hasPendingOperations && !isSyncing) {
    return null;
  }

  return (
    <View style={styles.container}>
      {!isOnline ? (
        <View style={styles.offlineContainer}>
          <Icon name="cloud-off" size={16} color="#721c24" style={styles.icon} />
          <Text style={styles.offlineText}>You are offline</Text>
          {hasPendingOperations && (
            <Text style={styles.pendingText}>
              {pendingCount} pending {pendingCount === 1 ? 'change' : 'changes'}
            </Text>
          )}
        </View>
      ) : isSyncing ? (
        <View style={styles.syncingContainer}>
          <Icon name="sync" size={16} color="#004085" style={styles.icon} />
          <Text style={styles.syncingText}>
            Syncing {pendingCount} {pendingCount === 1 ? 'change' : 'changes'}...
          </Text>
          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBar, { width: `${syncProgress}%` }]} />
          </View>
        </View>
      ) : hasPendingOperations ? (
        <TouchableOpacity style={styles.pendingContainer} onPress={forceSync}>
          <Icon name="cloud-queue" size={16} color="#856404" style={styles.icon} />
          <Text style={styles.pendingText}>
            {pendingCount} pending {pendingCount === 1 ? 'change' : 'changes'}
          </Text>
          <Text style={styles.syncNowText}>Tap to sync now</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 999,
  },
  offlineContainer: {
    backgroundColor: '#f8d7da',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: '#f5c6cb',
    flexDirection: 'column',
    alignItems: 'center',
  },
  syncingContainer: {
    backgroundColor: '#cce5ff',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: '#b8daff',
    flexDirection: 'column',
    alignItems: 'center',
  },
  pendingContainer: {
    backgroundColor: '#fff3cd',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: '#ffeeba',
    flexDirection: 'column',
    alignItems: 'center',
  },
  icon: {
    marginBottom: 4,
  },
  offlineText: {
    color: '#721c24',
    fontWeight: 'bold',
  },
  syncingText: {
    color: '#004085',
  },
  pendingText: {
    color: '#856404',
    fontSize: 12,
    marginTop: 2,
  },
  syncNowText: {
    color: '#0c5460',
    fontSize: 12,
    marginTop: 4,
    textDecorationLine: 'underline',
  },
  progressBarContainer: {
    height: 4,
    backgroundColor: '#e9ecef',
    borderRadius: 2,
    width: '100%',
    marginTop: 8,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#007bff',
  },
});

export default OfflineNotice;

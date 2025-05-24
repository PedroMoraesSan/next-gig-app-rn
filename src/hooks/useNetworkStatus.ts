import { useState, useEffect } from 'react';
import { networkService } from '../services/networkService';

/**
 * Hook to monitor network connectivity status
 * @returns Object containing isOnline status and network details
 */
export const useNetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(networkService.isNetworkConnected());
  const [networkDetails, setNetworkDetails] = useState<any>(null);

  useEffect(() => {
    // Handle connectivity changes
    const handleConnectivityChange = (connected: boolean) => {
      setIsOnline(connected);
    };

    // Update network details
    const updateNetworkDetails = async () => {
      const state = await networkService.getCurrentNetworkState();
      setNetworkDetails(state);
    };

    // Set up listeners
    networkService.addConnectivityListener(handleConnectivityChange);
    networkService.startMonitoring();

    // Initial network details check
    updateNetworkDetails();

    // Clean up
    return () => {
      networkService.removeConnectivityListener(handleConnectivityChange);
      networkService.stopMonitoring();
    };
  }, []);

  return {
    isOnline,
    networkDetails,
  };
};

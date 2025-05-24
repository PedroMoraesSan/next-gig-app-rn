import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import { EventEmitter } from 'events';

/**
 * Network status service to monitor connectivity changes
 * and provide network status information to the app
 */
class NetworkService {
  private static instance: NetworkService;
  private isConnected: boolean = true;
  private eventEmitter: EventEmitter = new EventEmitter();
  private unsubscribe: (() => void) | null = null;

  // Event names
  static CONNECTIVITY_CHANGE = 'connectivityChange';

  private constructor() {
    // Initialize with current network state
    NetInfo.fetch().then(state => {
      this.isConnected = !!state.isConnected;
    });
  }

  static getInstance(): NetworkService {
    if (!NetworkService.instance) {
      NetworkService.instance = new NetworkService();
    }
    return NetworkService.instance;
  }

  /**
   * Start monitoring network status
   */
  startMonitoring(): void {
    if (this.unsubscribe) return;

    this.unsubscribe = NetInfo.addEventListener(this.handleNetworkChange);
    console.log('Network monitoring started');
  }

  /**
   * Stop monitoring network status
   */
  stopMonitoring(): void {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
      console.log('Network monitoring stopped');
    }
  }

  /**
   * Handle network state changes
   */
  private handleNetworkChange = (state: NetInfoState): void => {
    const wasConnected = this.isConnected;
    this.isConnected = !!state.isConnected;

    // Only emit event if connection state actually changed
    if (wasConnected !== this.isConnected) {
      console.log(`Network status changed: ${this.isConnected ? 'online' : 'offline'}`);
      this.eventEmitter.emit(NetworkService.CONNECTIVITY_CHANGE, this.isConnected);
    }
  };

  /**
   * Check if device is currently connected
   */
  isNetworkConnected(): boolean {
    return this.isConnected;
  }

  /**
   * Get current network state
   */
  async getCurrentNetworkState(): Promise<NetInfoState> {
    return await NetInfo.fetch();
  }

  /**
   * Add listener for connectivity changes
   */
  addConnectivityListener(listener: (isConnected: boolean) => void): void {
    this.eventEmitter.on(NetworkService.CONNECTIVITY_CHANGE, listener);
  }

  /**
   * Remove listener for connectivity changes
   */
  removeConnectivityListener(listener: (isConnected: boolean) => void): void {
    this.eventEmitter.off(NetworkService.CONNECTIVITY_CHANGE, listener);
  }
}

export const networkService = NetworkService.getInstance();

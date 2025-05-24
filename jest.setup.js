// Mock NativeWind
jest.mock('nativewind', () => ({
  styled: (component) => component,
}));

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(() => Promise.resolve()),
  getItem: jest.fn(() => Promise.resolve(null)),
  removeItem: jest.fn(() => Promise.resolve()),
}));

// Mock NetInfo
jest.mock('@react-native-community/netinfo', () => ({
  addEventListener: jest.fn(() => jest.fn()),
  fetch: jest.fn(() => Promise.resolve({ isConnected: true })),
}));

// Mock Firebase Messaging
jest.mock('@react-native-firebase/messaging', () => ({
  requestPermission: jest.fn(() => Promise.resolve(1)),
  hasPermission: jest.fn(() => Promise.resolve(1)),
  getToken: jest.fn(() => Promise.resolve('mock-token')),
  onMessage: jest.fn(() => jest.fn()),
  onNotificationOpenedApp: jest.fn(() => jest.fn()),
  getInitialNotification: jest.fn(() => Promise.resolve(null)),
  onTokenRefresh: jest.fn(() => jest.fn()),
  AuthorizationStatus: {
    AUTHORIZED: 1,
    PROVISIONAL: 2,
  },
}));

// Mock Sentry
jest.mock('@sentry/react-native', () => ({
  init: jest.fn(),
  captureException: jest.fn(),
  withErrorBoundary: jest.fn((component) => component),
}));

// Mock DocumentPicker
jest.mock('react-native-document-picker', () => ({
  pick: jest.fn(() => Promise.resolve([{ uri: 'file://test.pdf', name: 'test.pdf' }])),
  types: {
    pdf: 'application/pdf',
  },
  isCancel: jest.fn(() => false),
}));

// Mock RNFS
jest.mock('react-native-fs', () => ({
  DocumentDirectoryPath: '/mock/path',
  stat: jest.fn(() => Promise.resolve({ size: 1024, type: 'file' })),
  writeFile: jest.fn(() => Promise.resolve()),
}));

// Mock React Navigation
jest.mock('@react-navigation/native', () => ({
  useNavigation: jest.fn(() => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
  })),
  useRoute: jest.fn(() => ({
    params: {
      jobId: '1',
    },
  })),
}));

// Mock global fetch
global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({ data: {} }),
  })
);

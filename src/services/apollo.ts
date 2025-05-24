import { ApolloClient, InMemoryCache, createHttpLink, ApolloLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { persistCache } from 'apollo3-cache-persist';
import { RetryLink } from '@apollo/client/link/retry';
import NetInfo from '@react-native-community/netinfo';
import { createOfflineMutationLink, offlineQueue } from './offlineQueue';

// Create the http link with the actual Hasura endpoint
const httpLink = createHttpLink({
  uri: 'http://localhost:8080/v1/graphql',
});

// Create the auth link to add authentication headers
const authLink = setContext(async (_, { headers }) => {
  try {
    // Get the authentication token from AsyncStorage
    const token = await AsyncStorage.getItem('userToken');
    
    return {
      headers: {
        ...headers,
        authorization: token ? `Bearer ${token}` : '',
        'x-hasura-role': token ? 'user' : 'anonymous',
      }
    };
  } catch (e) {
    console.error('Error getting auth token', e);
    return {
      headers: {
        ...headers,
        'x-hasura-role': 'anonymous',
      }
    };
  }
});

// Error handling link
const errorLink = onError(({ graphQLErrors, networkError, operation, forward }) => {
  if (graphQLErrors) {
    for (let err of graphQLErrors) {
      console.log(
        `[GraphQL error]: Message: ${err.message}, Location: ${err.locations}, Path: ${err.path}`,
      );
      
      // Handle specific errors
      switch (err.extensions?.code) {
        case 'UNAUTHENTICATED':
          // Handle authentication errors - e.g., redirect to login
          AsyncStorage.removeItem('userToken');
          break;
        case 'FORBIDDEN':
          // Handle permission errors
          console.log('Permission denied');
          break;
      }
    }
  }
  
  if (networkError) {
    console.log(`[Network error]: ${networkError}`);
  }
  
  return forward(operation);
});

// Retry link for network failures
const retryLink = new RetryLink({
  delay: {
    initial: 300,
    max: 3000,
    jitter: true
  },
  attempts: {
    max: 5,
    retryIf: (error, _operation) => {
      return !!error && error.statusCode !== 401;
    }
  }
});

// Create the Apollo cache with improved pagination policies
const cache = new InMemoryCache({
  typePolicies: {
    Query: {
      fields: {
        jobs: {
          // Merge function for pagination
          keyArgs: ["where"],
          merge(existing = [], incoming, { args }) {
            // If we have no args, or we're loading the first page, just return incoming
            if (!args || !args.offset || args.offset === 0) {
              return incoming;
            }
            
            // Merge the existing and incoming arrays
            return [...existing, ...incoming];
          },
        },
        saved_jobs: {
          merge(existing = [], incoming) {
            return [...incoming];
          }
        },
        applications: {
          merge(existing = [], incoming) {
            return [...incoming];
          }
        },
        notifications: {
          merge(existing = [], incoming, { readField }) {
            // If there are no existing items, just return incoming
            if (!existing || existing.length === 0) return incoming;
            
            // Create a map of existing items by ID
            const existingMap = new Map();
            existing.forEach(item => {
              const id = readField('id', item);
              existingMap.set(id, item);
            });
            
            // Update or add incoming items
            incoming.forEach(item => {
              const id = readField('id', item);
              existingMap.set(id, item);
            });
            
            // Convert map back to array
            return Array.from(existingMap.values());
          }
        }
      },
    },
    Job: {
      // Unique identifier for Job type
      keyFields: ["id"],
    },
    User: {
      // Unique identifier for User type
      keyFields: ["id"],
    },
    Application: {
      keyFields: ["id"],
    },
    SavedJob: {
      keyFields: ["id"],
    },
    Notification: {
      keyFields: ["id"],
    },
  },
});

// Initialize Apollo Client
const initApolloClient = async () => {
  // Persist cache for offline support
  await persistCache({
    cache,
    storage: AsyncStorage,
    trigger: 'background',
    debounce: 1000,
  });

  // Create offline mutation link
  const offlineMutationLink = createOfflineMutationLink();

  // Create the Apollo Client
  const client = new ApolloClient({
    link: ApolloLink.from([
      offlineMutationLink,
      errorLink,
      retryLink,
      authLink,
      httpLink
    ]),
    cache,
    defaultOptions: {
      watchQuery: {
        fetchPolicy: 'cache-and-network',
        errorPolicy: 'all',
      },
      query: {
        fetchPolicy: 'cache-first',
        errorPolicy: 'all',
      },
      mutate: {
        errorPolicy: 'all',
      },
    },
    connectToDevTools: __DEV__,
  });

  // Initialize offline queue
  await offlineQueue.initialize(client);

  // Set up network status listener for offline support
  NetInfo.addEventListener(state => {
    const isConnected = state.isConnected;
    
    if (isConnected) {
      // When back online, refetch any stale queries
      client.refetchQueries({
        include: 'active',
      });
      
      // Process offline mutation queue
      offlineQueue.processQueue();
    }
  });

  return client;
};

export default initApolloClient;

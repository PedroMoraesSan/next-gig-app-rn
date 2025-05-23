import { ApolloClient, InMemoryCache, createHttpLink, ApolloLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { persistCache } from 'apollo3-cache-persist';
import { RetryLink } from '@apollo/client/link/retry';
import { offsetLimitPagination } from '@apollo/client/utilities';
import NetInfo from '@react-native-community/netinfo';
import { createOfflineMutationLink, offlineQueue } from './offlineQueue';

// Create the http link - replace with your Hasura endpoint
const httpLink = createHttpLink({
  uri: 'https://your-hasura-endpoint.hasura.app/v1/graphql',
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
        'x-hasura-role': 'user',
      }
    };
  } catch (e) {
    console.error('Error getting auth token', e);
    return {
      headers
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

// Create the Apollo cache with pagination policies
const cache = new InMemoryCache({
  typePolicies: {
    Query: {
      fields: {
        jobs: offsetLimitPagination(['where']),
        saved_jobs: {
          merge(existing = [], incoming) {
            return [...incoming];
          }
        },
        applications: {
          merge(existing = [], incoming) {
            return [...incoming];
          }
        }
      },
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
    }
  });

  return client;
};

export default initApolloClient;

import { useMutation, MutationHookOptions, MutationTuple } from '@apollo/client';
import { useNetworkStatus } from './useNetworkStatus';
import { offlineQueue } from '../services/offlineQueue';
import { validateEntityData } from '../utils/dataValidation';
import { offlineAnalytics, AnalyticsEventType } from '../services/offlineAnalytics';

/**
 * Custom hook for mutations with offline support
 * Handles validation, offline queueing, and analytics
 */
export function useMutationWithOfflineSupport<TData, TVariables>(
  mutation: any,
  options?: MutationHookOptions<TData, TVariables> & {
    entityType?: string;
    skipValidation?: boolean;
  }
): MutationTuple<TData, TVariables> {
  const { isOnline } = useNetworkStatus();
  const { entityType, skipValidation, ...mutationOptions } = options || {};

  // Use Apollo's useMutation hook
  const [mutate, result] = useMutation<TData, TVariables>(mutation, mutationOptions);

  // Enhanced mutation function with offline support
  const mutateWithOfflineSupport = async (
    variables: TVariables,
    overrideOptions?: MutationHookOptions<TData, TVariables>
  ) => {
    try {
      // Extract operation name
      const operationName = mutation.definitions.find(
        (def: any) => def.kind === 'OperationDefinition'
      )?.name?.value || 'UnknownOperation';

      // Validate data if entityType is provided and validation is not skipped
      if (entityType && !skipValidation) {
        const validationResult = validateEntityData(entityType, variables as any);
        if (!validationResult.isValid) {
          throw new Error(
            `Validation failed: ${Object.values(validationResult.errors).join(', ')}`
          );
        }
      }

      // Track analytics
      await offlineAnalytics.trackEvent(
        AnalyticsEventType.OFFLINE_OPERATION,
        operationName,
        {
          entityType,
          isOffline: !isOnline,
        }
      );

      // If online, perform the mutation normally
      if (isOnline) {
        return await mutate({
          variables,
          ...overrideOptions,
        });
      }

      // If offline, add to queue
      console.log('Device is offline, queueing mutation:', operationName);
      const id = await offlineQueue.addToQueue(
        mutation,
        variables,
        overrideOptions?.optimisticResponse || mutationOptions?.optimisticResponse,
        overrideOptions?.update || mutationOptions?.update,
        { ...mutationOptions?.context, ...overrideOptions?.context }
      );

      // Track offline operation
      await offlineAnalytics.trackOfflineOperation(operationName, entityType || 'unknown', {
        queueId: id,
        variables: JSON.stringify(variables).substring(0, 100) + '...',
      });

      // Return a mock result for offline case
      return {
        data: null,
        errors: [new Error(`Mutation queued for offline execution: ${id}`)],
        loading: false,
        called: true,
        client: result.client,
        reset: result.reset,
        observable: result.observable,
      } as any;
    } catch (error) {
      console.error('Error in mutation with offline support:', error);
      throw error;
    }
  };

  return [mutateWithOfflineSupport as any, result];
}

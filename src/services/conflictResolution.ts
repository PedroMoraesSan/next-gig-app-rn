/**
 * Conflict resolution service for handling data conflicts
 * between local and server data during offline synchronization
 */

export enum ConflictStrategy {
  CLIENT_WINS = 'client_wins',
  SERVER_WINS = 'server_wins',
  MERGE = 'merge',
  MANUAL = 'manual',
}

export interface ConflictResolutionConfig {
  strategy: ConflictStrategy;
  mergeFields?: string[];
  priorityFields?: {
    client: string[];
    server: string[];
  };
}

// Default conflict resolution configurations by entity type
const defaultConfigs: Record<string, ConflictResolutionConfig> = {
  profile: {
    strategy: ConflictStrategy.MERGE,
    priorityFields: {
      client: ['bio', 'skills', 'title', 'avatar'],
      server: ['email', 'phone', 'verified'],
    },
  },
  application: {
    strategy: ConflictStrategy.MERGE,
    priorityFields: {
      client: ['coverLetter', 'answers'],
      server: ['status', 'reviewedAt', 'feedback'],
    },
  },
  jobAlert: {
    strategy: ConflictStrategy.CLIENT_WINS,
  },
  savedJob: {
    strategy: ConflictStrategy.CLIENT_WINS,
  },
  resume: {
    strategy: ConflictStrategy.MERGE,
    priorityFields: {
      client: ['content', 'sections'],
      server: ['lastUpdated', 'version'],
    },
  },
};

/**
 * Resolve conflicts between client and server data
 * @param entityType Type of entity (profile, application, etc.)
 * @param clientData Client-side data
 * @param serverData Server-side data
 * @param customConfig Optional custom conflict resolution config
 * @returns Resolved data
 */
export function resolveConflict(
  entityType: string,
  clientData: Record<string, any>,
  serverData: Record<string, any>,
  customConfig?: ConflictResolutionConfig
): Record<string, any> {
  // Get config for this entity type, or use custom config if provided
  const config = customConfig || defaultConfigs[entityType] || { strategy: ConflictStrategy.SERVER_WINS };

  switch (config.strategy) {
    case ConflictStrategy.CLIENT_WINS:
      return { ...serverData, ...clientData };

    case ConflictStrategy.SERVER_WINS:
      return { ...clientData, ...serverData };

    case ConflictStrategy.MERGE:
      return mergeData(clientData, serverData, config);

    case ConflictStrategy.MANUAL:
      // For manual resolution, we return both versions
      // The calling code should handle presenting these to the user
      return {
        _conflict: true,
        _clientVersion: clientData,
        _serverVersion: serverData,
      };

    default:
      // Default to server wins
      return { ...clientData, ...serverData };
  }
}

/**
 * Merge data based on configuration
 */
function mergeData(
  clientData: Record<string, any>,
  serverData: Record<string, any>,
  config: ConflictResolutionConfig
): Record<string, any> {
  // Start with a base merged object
  const merged = { ...clientData, ...serverData };

  // If specific merge fields are defined, only merge those
  if (config.mergeFields) {
    const result = { ...serverData };
    config.mergeFields.forEach((field) => {
      if (clientData[field] !== undefined) {
        result[field] = clientData[field];
      }
    });
    return result;
  }

  // If priority fields are defined, apply them
  if (config.priorityFields) {
    // Apply server priority fields
    if (config.priorityFields.server) {
      config.priorityFields.server.forEach((field) => {
        if (serverData[field] !== undefined) {
          merged[field] = serverData[field];
        }
      });
    }

    // Apply client priority fields
    if (config.priorityFields.client) {
      config.priorityFields.client.forEach((field) => {
        if (clientData[field] !== undefined) {
          merged[field] = clientData[field];
        }
      });
    }
  }

  return merged;
}

/**
 * Check if there's a conflict between client and server data
 */
export function hasConflict(clientData: Record<string, any>, serverData: Record<string, any>): boolean {
  // Check if any fields have different values
  for (const key in clientData) {
    if (
      serverData[key] !== undefined &&
      JSON.stringify(clientData[key]) !== JSON.stringify(serverData[key])
    ) {
      return true;
    }
  }
  return false;
}

/**
 * Get fields that are in conflict
 */
export function getConflictingFields(
  clientData: Record<string, any>,
  serverData: Record<string, any>
): string[] {
  const conflictingFields: string[] = [];

  for (const key in clientData) {
    if (
      serverData[key] !== undefined &&
      JSON.stringify(clientData[key]) !== JSON.stringify(serverData[key])
    ) {
      conflictingFields.push(key);
    }
  }

  return conflictingFields;
}

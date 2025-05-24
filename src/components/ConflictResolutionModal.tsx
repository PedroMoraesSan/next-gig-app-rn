import React, { useState } from 'react';
import { View, Text, Modal, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { getConflictingFields } from '../services/conflictResolution';

interface ConflictResolutionModalProps {
  visible: boolean;
  onClose: () => void;
  onResolve: (resolvedData: Record<string, any>) => void;
  clientData: Record<string, any>;
  serverData: Record<string, any>;
  entityType: string;
}

/**
 * Modal component for manual conflict resolution
 * Shows differences between client and server data
 * and allows user to choose which version to keep
 */
const ConflictResolutionModal: React.FC<ConflictResolutionModalProps> = ({
  visible,
  onClose,
  onResolve,
  clientData,
  serverData,
  entityType,
}) => {
  // Get conflicting fields
  const conflictingFields = getConflictingFields(clientData, serverData);
  
  // State to track selected version for each field
  const [selectedVersions, setSelectedVersions] = useState<Record<string, 'client' | 'server'>>(() => {
    const initial: Record<string, 'client' | 'server'> = {};
    conflictingFields.forEach(field => {
      initial[field] = 'client'; // Default to client version
    });
    return initial;
  });

  // Handle selection change
  const handleSelectionChange = (field: string, version: 'client' | 'server') => {
    setSelectedVersions(prev => ({
      ...prev,
      [field]: version,
    }));
  };

  // Handle resolve button press
  const handleResolve = () => {
    // Create resolved data by merging based on selections
    const resolvedData = { ...serverData };
    
    // Apply selected versions
    Object.entries(selectedVersions).forEach(([field, version]) => {
      if (version === 'client') {
        resolvedData[field] = clientData[field];
      }
    });
    
    onResolve(resolvedData);
    onClose();
  };

  // Format value for display
  const formatValue = (value: any): string => {
    if (value === null) return 'null';
    if (value === undefined) return 'undefined';
    if (typeof value === 'object') return JSON.stringify(value, null, 2);
    return String(value);
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.title}>Resolve Conflicts</Text>
          <Text style={styles.subtitle}>
            {entityType.charAt(0).toUpperCase() + entityType.slice(1)} data has changed both locally and on the server.
            Please select which version to keep for each field.
          </Text>

          <ScrollView style={styles.conflictsContainer}>
            {conflictingFields.map(field => (
              <View key={field} style={styles.conflictItem}>
                <Text style={styles.fieldName}>{field}</Text>
                
                <View style={styles.optionsContainer}>
                  <TouchableOpacity
                    style={[
                      styles.optionButton,
                      selectedVersions[field] === 'client' && styles.selectedOption,
                    ]}
                    onPress={() => handleSelectionChange(field, 'client')}
                  >
                    <Text style={styles.optionLabel}>Your changes</Text>
                    <Text style={styles.optionValue}>{formatValue(clientData[field])}</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[
                      styles.optionButton,
                      selectedVersions[field] === 'server' && styles.selectedOption,
                    ]}
                    onPress={() => handleSelectionChange(field, 'server')}
                  >
                    <Text style={styles.optionLabel}>Server version</Text>
                    <Text style={styles.optionValue}>{formatValue(serverData[field])}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </ScrollView>

          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.resolveButton} onPress={handleResolve}>
              <Text style={styles.resolveButtonText}>Resolve Conflicts</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    width: '100%',
    maxHeight: '80%',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  conflictsContainer: {
    maxHeight: 400,
  },
  conflictItem: {
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 15,
  },
  fieldName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  optionsContainer: {
    flexDirection: 'column',
    gap: 10,
  },
  optionButton: {
    padding: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
  },
  selectedOption: {
    borderColor: '#007bff',
    backgroundColor: '#f0f7ff',
  },
  optionLabel: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  optionValue: {
    fontSize: 14,
    color: '#333',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  cancelButton: {
    padding: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    flex: 1,
    marginRight: 10,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#666',
  },
  resolveButton: {
    padding: 10,
    backgroundColor: '#007bff',
    borderRadius: 5,
    flex: 1,
    marginLeft: 10,
    alignItems: 'center',
  },
  resolveButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default ConflictResolutionModal;

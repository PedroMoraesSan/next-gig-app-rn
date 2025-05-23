import { Platform } from 'react-native';
import DocumentPicker, { DocumentPickerResponse } from 'react-native-document-picker';
import RNFS from 'react-native-fs';
import { gql } from '@apollo/client';
import client from './apollo';

const UPLOAD_FILE = gql`
  mutation UploadFile($file: Upload!) {
    uploadFile(file: $file) {
      url
    }
  }
`;

export const pickDocument = async () => {
  try {
    const result = await DocumentPicker.pick({
      type: [DocumentPicker.types.pdf, DocumentPicker.types.docx],
    });
    
    return result[0];
  } catch (err) {
    if (DocumentPicker.isCancel(err)) {
      // User cancelled the picker
      return null;
    } else {
      throw err;
    }
  }
};

export const uploadResume = async (file: DocumentPickerResponse) => {
  try {
    // Read file as base64
    const fileData = await RNFS.readFile(file.uri, 'base64');
    
    // Create file object for upload
    const fileObject = {
      name: file.name,
      type: file.type,
      size: file.size,
      uri: Platform.OS === 'android' ? file.uri : file.uri.replace('file://', ''),
      base64: fileData
    };
    
    // Upload file
    const { data } = await client.mutate({
      mutation: UPLOAD_FILE,
      variables: { file: fileObject }
    });
    
    return data.uploadFile.url;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};

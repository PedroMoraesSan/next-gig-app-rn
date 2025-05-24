import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RNFS from 'react-native-fs';

// File types
export enum FileType {
  RESUME = 'resume',
  COVER_LETTER = 'cover_letter',
  PROFILE_IMAGE = 'profile_image',
}

// File upload result
export interface FileUploadResult {
  url: string;
  fileName: string;
  fileType: string;
  fileSize: number;
}

// File upload service
class FileUploadService {
  // Upload file to storage
  async uploadFile(
    fileUri: string,
    fileType: FileType = FileType.RESUME,
    fileName?: string
  ): Promise<FileUploadResult> {
    try {
      // Get file info
      const fileInfo = await RNFS.stat(fileUri);
      
      // Generate file name if not provided
      const generatedFileName = fileName || `${fileType}_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
      
      // In a real app, you would upload the file to a storage service like S3
      // For now, we'll just simulate an upload
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Get file extension
      const fileExtension = fileUri.split('.').pop() || '';
      
      // Generate mock URL
      const mockUrl = `https://storage.example.com/${fileType}s/${generatedFileName}.${fileExtension}`;
      
      // Return mock result
      return {
        url: mockUrl,
        fileName: generatedFileName,
        fileType: fileInfo.type || '',
        fileSize: fileInfo.size,
      };
    } catch (error) {
      console.error('Error uploading file:', error);
      throw new Error('Failed to upload file');
    }
  }
  
  // Download file from storage
  async downloadFile(
    url: string,
    destinationPath?: string
  ): Promise<string> {
    try {
      // Generate destination path if not provided
      const fileName = url.split('/').pop() || `file_${Date.now()}.pdf`;
      const filePath = destinationPath || `${RNFS.DocumentDirectoryPath}/${fileName}`;
      
      // In a real app, you would download the file from a storage service
      // For now, we'll just simulate a download
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Create an empty file to simulate download
      await RNFS.writeFile(filePath, 'Mock file content', 'utf8');
      
      return filePath;
    } catch (error) {
      console.error('Error downloading file:', error);
      throw new Error('Failed to download file');
    }
  }
  
  // Delete file from storage
  async deleteFile(url: string): Promise<boolean> {
    try {
      // In a real app, you would delete the file from a storage service
      // For now, we'll just simulate a deletion
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return true;
    } catch (error) {
      console.error('Error deleting file:', error);
      throw new Error('Failed to delete file');
    }
  }
  
  // Get file size in human-readable format
  getFileSizeString(bytes: number): string {
    if (bytes < 1024) {
      return `${bytes} B`;
    } else if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    } else if (bytes < 1024 * 1024 * 1024) {
      return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    } else {
      return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
    }
  }
  
  // Get file name from URL
  getFileNameFromUrl(url: string): string {
    return url.split('/').pop() || '';
  }
  
  // Get file extension from URL
  getFileExtensionFromUrl(url: string): string {
    const fileName = this.getFileNameFromUrl(url);
    return fileName.split('.').pop() || '';
  }
  
  // Check if file is an image
  isImage(url: string): boolean {
    const extension = this.getFileExtensionFromUrl(url).toLowerCase();
    return ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension);
  }
  
  // Check if file is a PDF
  isPdf(url: string): boolean {
    const extension = this.getFileExtensionFromUrl(url).toLowerCase();
    return extension === 'pdf';
  }
}

// Export singleton instance
export const fileUpload = new FileUploadService();

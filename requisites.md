# Next-Gig-App-RN Production Requisites

This document outlines all the requirements and configuration steps needed to deploy the Next-Gig-App-RN application in a production environment with real data and endpoints.

## Table of Contents

1. [Backend Infrastructure](#backend-infrastructure)
2. [Authentication Setup](#authentication-setup)
3. [Storage Services](#storage-services)
4. [Push Notification Services](#push-notification-services)
5. [Analytics and Error Tracking](#analytics-and-error-tracking)
6. [Environment Configuration](#environment-configuration)
7. [Deployment Checklist](#deployment-checklist)

## Backend Infrastructure

### Hasura GraphQL Engine

- **Hasura Instance**: Deploy a Hasura instance on your preferred hosting platform (Hasura Cloud, AWS, GCP, Azure, etc.)
  - Production URL: Replace `http://localhost:8080/v1/graphql` in `src/services/apollo.ts` with your production Hasura endpoint

- **PostgreSQL Database**: Set up a managed PostgreSQL database
  - Connection string: Configure in Hasura environment variables
  - Recommended: Use a connection pooler like PgBouncer for production

- **Database Migrations**:
  - Apply migrations using Hasura CLI:
    ```bash
    hasura migrate apply --endpoint https://your-hasura-endpoint.com --admin-secret your-admin-secret
    ```
  - Apply metadata:
    ```bash
    hasura metadata apply --endpoint https://your-hasura-endpoint.com --admin-secret your-admin-secret
    ```

- **Admin Secret**: Set a strong admin secret for Hasura
  - Update in CI/CD pipeline environment variables
  - Never expose this in client-side code

### API Services

- **Authentication API**: Implement or use a service for JWT generation and validation
  - Endpoint: Update in `src/services/authService.ts`
  - Required endpoints:
    - `/login` - Email/password authentication
    - `/register` - User registration
    - `/refresh-token` - JWT refresh
    - `/validate-token` - Token validation for biometric auth

- **File Upload API**: Implement service for resume and profile image uploads
  - Endpoint: Update in `src/services/fileUpload.ts`
  - Required functionality:
    - File upload with progress tracking
    - Secure URL generation
    - File type validation

## Authentication Setup

### JWT Configuration

- **JWT Secret**: Set a strong secret for signing JWTs
  - Configure in your authentication service
  - Update Hasura to use the same secret for verification

- **JWT Claims Structure**:
  ```json
  {
    "https://hasura.io/jwt/claims": {
      "x-hasura-allowed-roles": ["user", "anonymous"],
      "x-hasura-default-role": "user",
      "x-hasura-user-id": "user-uuid"
    },
    "sub": "user-uuid",
    "name": "User Name",
    "email": "user@example.com",
    "iat": 1516239022,
    "exp": 1516242622
  }
  ```

- **Token Expiration**: Configure appropriate expiration times
  - Access token: 1-2 hours recommended
  - Refresh token: 7-30 days recommended

### Biometric Authentication

- **Keychain/Keystore Integration**:
  - iOS: Update `NSFaceIDUsageDescription` in Info.plist
  - Android: Configure biometric prompt in `android/app/src/main/res/values/strings.xml`

- **Secure Storage**: Configure secure storage for biometric tokens
  - iOS: Use Keychain
  - Android: Use Keystore
  - Update configuration in `src/services/biometricService.ts`

## Storage Services

### File Storage

- **Cloud Storage Provider**: Set up a storage service (AWS S3, Google Cloud Storage, etc.)
  - Bucket name: Configure in `src/services/fileUpload.ts`
  - Region: Configure based on your user base location
  - CORS configuration: Allow requests from your app domains

- **CDN Configuration**: Set up a CDN for faster file delivery
  - Update URLs in `src/services/fileUpload.ts`
  - Configure cache policies for different file types

- **Security**: Configure proper access controls
  - Use signed URLs for private files
  - Set appropriate bucket policies

## Push Notification Services

### Firebase Cloud Messaging (FCM)

- **Firebase Project**: Create a Firebase project for your app
  - Download `google-services.json` (Android) and place in `android/app/`
  - Download `GoogleService-Info.plist` (iOS) and place in `ios/`

- **FCM Configuration**:
  - Update Firebase configuration in `src/services/firebase.ts`
  - Server key: Configure in your notification backend service
  - Update topic names for job alerts in `src/services/notificationService.ts`

### Apple Push Notification Service (APNs)

- **Apple Developer Account**: Configure push notification capabilities
  - Generate push notification certificate or key
  - Configure in your notification backend service

- **Notification Backend**: Implement a service to send notifications
  - Endpoint: Update in `src/services/pushNotificationService.ts`
  - Required functionality:
    - Send to specific devices
    - Send to topics
    - Handle notification delivery status

## Analytics and Error Tracking

### Segment Analytics

- **Segment Account**: Create a Segment account and project
  - Write key: Replace `'YOUR_SEGMENT_WRITE_KEY'` in `src/services/analytics.ts`
  - Configure destinations (Amplitude, Mixpanel, etc.)

- **Event Tracking**: Update event names and properties if needed
  - Review event definitions in `src/services/analytics.ts`
  - Configure user identification properties

### Sentry Error Tracking

- **Sentry Project**: Create a Sentry project for your app
  - DSN: Replace `'YOUR_SENTRY_DSN'` in `src/services/errorTracking.ts`
  - Configure environment separation (dev, staging, prod)

- **Release Tracking**: Set up release tracking in your CI/CD pipeline
  - Create source maps for better stack traces
  - Configure version naming convention

## Environment Configuration

### Environment Variables

- **React Native Config**: Install and configure `react-native-config`
  - Create `.env.development`, `.env.staging`, and `.env.production` files
  - Add to `.gitignore` to prevent committing secrets

- **Required Variables**:
  ```
  # API Endpoints
  API_URL=https://api.example.com
  GRAPHQL_URL=https://hasura.example.com/v1/graphql
  
  # Authentication
  AUTH_DOMAIN=auth.example.com
  
  # Storage
  STORAGE_URL=https://storage.example.com
  STORAGE_BUCKET=your-bucket-name
  
  # Analytics & Error Tracking
  SEGMENT_WRITE_KEY=your-segment-write-key
  SENTRY_DSN=your-sentry-dsn
  
  # Push Notifications
  FCM_SERVER_KEY=your-fcm-server-key
  ```

### Feature Flags

- **Remote Config**: Set up a remote configuration service
  - Firebase Remote Config recommended
  - Configure in `src/services/featureFlags.ts` (create this file)

- **Recommended Flags**:
  - `enable_biometric_auth`: Control biometric authentication availability
  - `enable_push_notifications`: Control push notification features
  - `maintenance_mode`: Enable/disable app during maintenance
  - `force_update`: Force users to update the app

## Deployment Checklist

### Pre-Deployment Tasks

1. **Update App Version**:
   - Update version in `package.json`
   - Update version code in `android/app/build.gradle`
   - Update version and build number in Xcode project

2. **Environment Configuration**:
   - Verify all environment variables are set correctly
   - Check API endpoints are pointing to production

3. **Remove Development Code**:
   - Remove console.log statements
   - Remove mock data usage
   - Disable development features

### iOS Deployment

1. **App Store Connect Setup**:
   - Create app listing if not exists
   - Configure app metadata, screenshots, and description
   - Set up App Store Connect API key for CI/CD

2. **Certificates and Provisioning**:
   - Update distribution certificate
   - Update provisioning profiles
   - Configure push notification entitlements

3. **Build and Submit**:
   - Archive app in Xcode or via CI/CD
   - Run TestFlight testing before public release
   - Submit for App Store review

### Android Deployment

1. **Google Play Console Setup**:
   - Create app listing if not exists
   - Configure app metadata, screenshots, and description
   - Set up release tracks (internal, alpha, beta, production)

2. **Signing Configuration**:
   - Configure signing key in `android/app/build.gradle`
   - Secure your keystore file
   - Set up Play App Signing

3. **Build and Submit**:
   - Generate signed APK or App Bundle
   - Run internal testing before public release
   - Submit for Google Play review

### Post-Deployment Tasks

1. **Monitor Error Reports**:
   - Set up Sentry alerts
   - Configure crash reporting thresholds

2. **Analytics Review**:
   - Verify events are being tracked correctly
   - Set up dashboards for key metrics

3. **Performance Monitoring**:
   - Configure performance monitoring in Firebase
   - Set up alerts for performance degradation

## Conclusion

Following this guide will ensure your Next-Gig-App-RN application is properly configured for a production environment with real data and endpoints. Make sure to test thoroughly in a staging environment before deploying to production.

For any questions or issues, refer to the project documentation or contact the development team.

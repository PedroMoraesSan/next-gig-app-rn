# NextGig App Development Roadmap

## Overview

This document outlines the implementation roadmap for transforming the static Next-Gig-App into a fully functional React Native mobile application with dynamic data using Hasura GraphQL and Apollo Client. The current application consists of static pages and components without real database connectivity or API endpoints.

## Current Architecture

- **Frontend**: Next.js 15, React 19, TypeScript
- **UI**: Tailwind CSS, shadcn/ui components, Radix UI primitives
- **State**: Currently static/mock data

## Target Architecture

- **Frontend**: React Native with TypeScript
- **UI**: React Native components with NativeWind (Tailwind CSS for React Native)
- **API Layer**: Apollo Client for GraphQL operations
- **Backend**: Hasura GraphQL Engine
- **Database**: PostgreSQL (managed by Hasura)
- **Authentication**: JWT-based authentication with refresh tokens
- **Navigation**: React Navigation

## Implementation Roadmap

### Phase 1: React Native Project Setup

#### 1.1 Project Initialization
- [x] Create new React Native project with TypeScript template
```bash
npx react-native init NextGigApp --template react-native-template-typescript
```
- [x] Set up project structure (screens, components, hooks, etc.)
- [x] Configure ESLint and Prettier for code quality
- [x] Set up Git repository and branching strategy

#### 1.2 UI Framework Setup
- [x] Install and configure NativeWind
```bash
npm install nativewind
npm install --save-dev tailwindcss
```
- [x] Set up tailwind.config.js for React Native
- [x] Create base component library with NativeWind styling
- [x] Implement theming support (light/dark mode)

#### 1.3 Navigation Setup
- [x] Install React Navigation
```bash
npm install @react-navigation/native
npm install react-native-screens react-native-safe-area-context
```
- [x] Set up navigation structure (stack, tab navigators)
- [x] Implement deep linking configuration
- [x] Create authentication flow navigation

### Phase 2: Setup Backend Infrastructure

#### 2.1 Hasura Setup
- [x] Deploy Hasura instance (options: Hasura Cloud, Docker, or managed service)
- [x] Connect PostgreSQL database to Hasura
- [x] Configure Hasura console access and security settings
- [x] Set up development, staging, and production environments

#### 2.2 Database Schema Design
- [x] Design database schema for core entities:
  - Users/Profiles
  - Jobs
  - Companies
  - Applications
  - Saved Jobs
  - Resumes
  - Job Alerts
  - Notifications
- [x] Implement relationships between entities
- [x] Set up initial migrations
- [x] Create seed data for development

#### 2.3 Hasura Permissions
- [x] Configure role-based access control (RBAC)
  - Anonymous users (limited read access)
  - Authenticated users (personal data access)
  - Employers (job posting access)
  - Admins (full access)
- [x] Set up row-level security policies
- [x] Configure column-level permissions

### Phase 3: Authentication Integration

#### 3.1 Auth Provider Selection and Setup
- [x] Select authentication provider (JWT-based authentication)
- [x] Implement authentication flow in React Native
- [x] Configure secure token storage (AsyncStorage for development, SecureStore for production)
- [x] Set up user registration and login screens

#### 3.2 Hasura-Auth Integration
- [x] Configure JWT verification in Hasura
- [x] Set up webhook or JWT claims mapping
- [x] Test authentication flow with Hasura permissions
- [x] Implement role-based navigation in the app

### Phase 4: Apollo Client Integration

#### 4.1 Apollo Client Setup
- [x] Install Apollo Client dependencies
```bash
npm install @apollo/client graphql
```
- [x] Create Apollo client configuration for React Native
- [x] Set up Apollo Provider in the app
- [x] Configure authentication headers for GraphQL requests
- [x] Implement offline support with Apollo cache persistence

#### 4.2 GraphQL Schema and Operations
- [x] Define GraphQL queries for each major feature
- [x] Create mutations for user actions
- [x] Set up subscriptions for real-time features
- [x] Implement error handling and loading states
- [x] Create optimistic UI updates for better UX

#### 4.3 TypeScript Integration
- [x] Generate TypeScript types from GraphQL schema
- [x] Set up codegen for automatic type generation
```bash
npm install -D @graphql-codegen/cli @graphql-codegen/typescript @graphql-codegen/typescript-operations @graphql-codegen/typescript-react-apollo
```
- [x] Integrate types with React Native components

### Phase 5: Feature Implementation

#### 5.1 User Authentication and Profile
- [x] Build login/registration screens with auth provider
- [x] Implement profile data fetching and updating
- [x] Add profile image upload functionality (with device camera integration)
- [x] Create user onboarding flow with GraphQL mutations

#### 5.2 Job Search and Filtering
- [x] Replace static job data with GraphQL queries
- [x] Implement search filters with GraphQL variables
- [x] Add infinite scrolling for job listings
- [x] Create job detail screen with dynamic data
- [x] Implement location-based job search with device GPS

#### 5.3 Job Applications
- [x] Build application submission flow with mutations
- [x] Implement application tracking with real-time updates
- [x] Add document picker for resume attachment
- [x] Create push notifications for application status changes

#### 5.4 Saved Jobs and Alerts
- [x] Implement job saving functionality
- [x] Create job alert creation and management
- [x] Set up notification system for new matching jobs
- [x] Add background fetch for periodic job updates

#### 5.5 Resume Builder
- [x] Convert static resume builder to use GraphQL
- [x] Implement resume storage and versioning
- [x] Add PDF generation and sharing functionality
- [x] Create resume preview capability

### Phase 6: Mobile-Specific Features

#### 6.1 Push Notifications
- [x] Set up Firebase Cloud Messaging integration
- [x] Implement notification handling service
- [x] Create notification preferences screen
- [x] Implement backend notification delivery service
- [x] Add deep linking from notifications
- [ ] Implement notification analytics
- [ ] Add notification grouping and management

#### 6.2 Offline Support
- [x] Implement Apollo cache persistence
- [x] Add offline mutation queue with retry mechanism
- [x] Implement network status monitoring
- [x] Add sync indicators for offline operations
- [x] Create conflict resolution service
- [ ] Add manual conflict resolution UI
- [ ] Implement entity-specific merge strategies
- [ ] Add offline data validation
- [ ] Create offline analytics tracking

#### 6.3 Device Integration
- [x] Implement biometric authentication
- [x] Add calendar integration for interviews
- [x] Create contact sharing functionality
- [x] Implement location services for job proximity

### Phase 7: Performance Optimization and Deployment

### Phase 7: Performance Optimization and Deployment

#### 7.1 Performance Optimization
- [x] Implement Apollo cache policies
- [x] Add query optimization with fragments
- [ ] Optimize React Native rendering performance
- [ ] Reduce bundle size with code splitting
- [ ] Implement query batching
- [ ] Add performance monitoring
- [ ] Optimize image loading and caching

#### 7.2 Deployment Pipeline
- [x] Set up CI/CD pipeline for mobile app and Hasura
- [x] Configure environment variables for different environments
- [x] Implement database migration strategy
- [ ] Create backup and disaster recovery plan
- [ ] Set up app store deployment automation
- [ ] Implement code signing and provisioning profiles
- [ ] Create release management process

#### 7.3 Monitoring and Analytics
- [x] Set up error tracking (Sentry)
- [x] Implement offline analytics tracking
- [ ] Add usage analytics with event tracking
- [ ] Create admin dashboard for system monitoring
- [ ] Implement crash reporting
- [ ] Add performance metrics collection
- [ ] Create user behavior analytics

## Example Data Files

The following files contain example/mock data that will need to be updated with real data in production:

### 1. Mock Data Files
- `/src/constants/mockData.ts`: Contains mock job listings for development and testing
- `/hasura/seeds/1684712345678_sample_data/up.sql`: Contains initial database seed data
- `/hasura/seeds/1_sample_data.sql`: Contains basic seed data for testing

### 2. Configuration Files with Example Values
- `/src/services/apollo.ts`: Contains example GraphQL endpoint URL
- `/src/services/pushNotificationService.ts`: Contains example notification handling code
- `/src/services/offlineAnalytics.ts`: Contains example analytics endpoint

### 3. Test Data
- `/src/components/__tests__/JobCard.test.tsx`: Contains test data for JobCard component
- `/e2e/starter.test.js`: Contains example test data for E2E tests

When developing, these files should be updated with appropriate data for your environment.

## Implementation Considerations

### Mobile-Specific Considerations
- Design for different screen sizes and orientations
- Implement proper keyboard handling
- Consider touch interactions vs mouse interactions
- Plan for offline usage scenarios
- Optimize battery and data usage

### Data Modeling Decisions
- Consider using Postgres JSON fields for flexible schema parts
- Plan for internationalization from the beginning
- Design with scalability in mind (sharding, read replicas)

### Security Considerations
- Implement proper JWT expiration and refresh token flow
- Use secure storage for tokens (Keychain/Keystore)
- Use Hasura's permission system for data access control
- Consider certificate pinning for API requests
- Implement proper error handling that doesn't leak sensitive information

### Performance Considerations
- Use Apollo cache effectively to reduce network requests
- Consider implementing cursor-based pagination for large lists
- Use GraphQL fragments to optimize query composition
- Implement batching for multiple queries
- Optimize React Native rendering with memoization and pure components

### Development Workflow
- Set up a development database with realistic seed data
- Create Hasura migrations for all schema changes
- Use feature branches with isolated preview environments
- Implement end-to-end testing for critical user flows
- Set up device testing strategy (real devices vs emulators)

## Implementation Progress

### Current Status
- Basic React Native project structure set up
- UI components created with NativeWind styling
- Navigation structure implemented with authentication flow
- Hasura backend configured with database schema and permissions
- Apollo Client integration with authentication and offline support
- Job search and filtering implemented with infinite scrolling
- Job application flow with resume upload functionality
- Job alerts and saved jobs functionality
- Profile management with resume builder

### Next Steps
- Implement push notifications for job alerts and application updates
- Add biometric authentication for enhanced security
- Optimize performance for large job listings
- Set up CI/CD pipeline for deployment
- Implement analytics for user behavior tracking

## Error Handling Scenarios

### Network Errors
- **Offline Detection**: The app detects when the device goes offline using NetworkService
- **Mutation Queueing**: Mutations are automatically queued when offline using offlineQueue
- **Retry Mechanism**: Failed network requests are retried with exponential backoff
- **User Feedback**: SyncIndicator shows offline status and pending operations

### Authentication Errors
- **Token Expiration**: Apollo error link handles authentication errors
- **Refresh Token Flow**: AuthService handles token refresh when expired
- **Session Management**: User is redirected to login when authentication fails
- **Biometric Auth Errors**: BiometricService handles authentication failures

### Data Synchronization
- **Conflict Detection**: The app detects conflicts between local and server data
- **Conflict Resolution**: ConflictResolutionService handles automatic conflict resolution
- **Manual Resolution**: ConflictResolutionModal allows users to manually resolve conflicts
- **Version Control**: Entity-specific merge strategies handle data versioning

### Push Notification Errors
- **Permission Handling**: NotificationService handles permission changes
- **Token Refresh**: FirebaseService handles FCM token refresh
- **Delivery Confirmation**: Backend tracks notification delivery status
- **Error Recovery**: Failed notifications are retried with backoff

### Form Validation
- **Client-side Validation**: DataValidation utility validates form data before submission
- **Server-side Validation**: GraphQL errors are handled and displayed to the user
- **Offline Validation**: Mutations are validated before being added to the offline queue
- **Error Display**: Form errors are displayed with clear messages

## Testing Requirements

### Offline Functionality Tests
```typescript
describe('Offline Support', () => {
  it('should queue mutations when offline', async () => {
    // Mock offline state
    // Perform mutation
    // Check if added to queue
  });
  
  it('should sync when back online', async () => {
    // Mock offline -> online transition
    // Check if queue processed
  });
  
  it('should handle conflicts correctly', async () => {
    // Create conflict scenario
    // Check resolution strategy
  });
});
```

### Push Notification Tests
```typescript
describe('Push Notifications', () => {
  it('should handle permission changes', async () => {
    // Mock permission changes
    // Check handling
  });
  
  it('should process notification payload', async () => {
    // Mock notification receipt
    // Check processing
  });
  
  it('should navigate correctly from notification', async () => {
    // Mock notification open
    // Check navigation
  });
});
```

### Data Synchronization Tests
```typescript
describe('Data Sync', () => {
  it('should merge server and local changes', async () => {
    // Create merge scenario
    // Check result
  });
  
  it('should handle version conflicts', async () => {
    // Create version conflict
    // Check resolution
  });
  
  it('should allow manual conflict resolution', async () => {
    // Create manual resolution scenario
    // Check UI and result
  });
});
```

## Technical Resources

### React Native Resources
- [React Native Documentation](https://reactnative.dev/docs/getting-started)
- [NativeWind Documentation](https://www.nativewind.dev/)
- [React Navigation](https://reactnavigation.org/)
- [React Native Gesture Handler](https://docs.swmansion.com/react-native-gesture-handler/)

### Hasura Resources
- [Hasura Documentation](https://hasura.io/docs/latest/index/)
- [Hasura Cloud](https://cloud.hasura.io/)
- [Hasura GitHub Actions](https://github.com/hasura/github-actions)
- [Hasura CLI](https://hasura.io/docs/latest/hasura-cli/index/)

### Apollo Client Resources
- [Apollo Client Documentation](https://www.apollographql.com/docs/react/)
- [Apollo Client with React Native](https://www.apollographql.com/docs/react/integrations/react-native/)
- [Apollo Client Caching](https://www.apollographql.com/docs/react/caching/overview/)
- [Apollo Client DevTools](https://www.apollographql.com/docs/react/development-testing/developer-tooling/)

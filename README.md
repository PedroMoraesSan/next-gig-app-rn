# NextGig App - React Native

A React Native implementation of the NextGig job search platform, built with TypeScript, NativeWind, and Apollo GraphQL.

## Project Overview

NextGig is a mobile job search platform that connects job seekers with employers. The application provides a seamless experience for users to find, save, and apply for jobs, as well as manage their professional profiles and track their applications.

## Features

- **User Authentication**: Login and registration system with biometric authentication
- **Job Search & Filtering**: Find jobs based on various criteria with location-based search
- **Job Applications**: Apply to jobs with resume and cover letter
- **Profile Management**: Create and update professional profiles
- **Resume Builder**: Create and manage professional resumes
- **Job Alerts**: Set up notifications for new job postings
- **Application Tracking**: Monitor the status of job applications
- **Saved Jobs**: Bookmark jobs for later review
- **Offline Support**: Use the app even when offline with data synchronization
- **Push Notifications**: Receive alerts for job matches and application updates

## Tech Stack

- **Frontend**: React Native, TypeScript
- **Styling**: NativeWind (Tailwind CSS for React Native)
- **Navigation**: React Navigation
- **API Layer**: Apollo Client for GraphQL operations
- **Backend**: Hasura GraphQL Engine
- **Database**: PostgreSQL (managed by Hasura)
- **Authentication**: JWT-based authentication with biometrics
- **Push Notifications**: Firebase Cloud Messaging
- **Analytics**: Segment
- **Error Tracking**: Sentry

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- React Native development environment set up
- Docker (for running Hasura locally)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/PedroMoraesSan/next-gig-app-rn.git
cd next-gig-app-rn
```

2. Install dependencies:
```bash
npm install
```

3. Start the Hasura backend:
```bash
cd hasura
docker-compose up -d
```

4. Apply Hasura migrations and metadata:
```bash
hasura migrate apply
hasura metadata apply
hasura seed apply
```

5. Start the React Native development server:
```bash
npm start
```

6. Run the app on a device or emulator:
```bash
# For Android
npm run android

# For iOS
npm run ios
```

## Project Structure

- `/src`: Main source code directory
  - `/components`: Reusable UI components
  - `/screens`: Application screens
  - `/navigation`: Navigation configuration
  - `/hooks`: Custom React hooks
  - `/services`: API and backend services
  - `/graphql`: GraphQL queries, mutations, and fragments
  - `/context`: React context providers
  - `/utils`: Helper functions
  - `/assets`: Images, fonts, etc.
  - `/types`: TypeScript type definitions
  - `/constants`: App constants
- `/hasura`: Hasura configuration and migrations

## Testing

The project includes unit tests and end-to-end tests:

```bash
# Run unit tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate test coverage report
npm run test:coverage

# Run end-to-end tests (requires Detox setup)
npm run e2e:build
npm run e2e:test
```

## CI/CD

The project uses GitHub Actions for continuous integration and deployment. The workflow includes:

- Running tests
- Linting code
- Building Android and iOS apps
- Deploying to app stores (not yet implemented)

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -am 'Add my feature'`
4. Push to the branch: `git push origin feature/my-feature`
5. Submit a pull request

## License

This project is licensed under the MIT License.

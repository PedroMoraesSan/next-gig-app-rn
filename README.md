# NextGig App - React Native

A React Native implementation of the NextGig job search platform, built with TypeScript, NativeWind, and Apollo GraphQL.

## Project Overview

NextGig is a mobile job search platform that connects job seekers with employers. The application provides a seamless experience for users to find, save, and apply for jobs, as well as manage their professional profiles and track their applications.

## Features

- **User Authentication**: Login and registration system
- **Job Search & Filtering**: Find jobs based on various criteria
- **Job Applications**: Apply to jobs with resume and cover letter
- **Profile Management**: Create and update professional profiles
- **Resume Builder**: Create and manage professional resumes
- **Job Alerts**: Set up notifications for new job postings
- **Application Tracking**: Monitor the status of job applications
- **Saved Jobs**: Bookmark jobs for later review

## Tech Stack

- **Frontend**: React Native, TypeScript
- **Styling**: NativeWind (Tailwind CSS for React Native)
- **Navigation**: React Navigation
- **API Layer**: Apollo Client for GraphQL operations
- **Backend**: Hasura GraphQL Engine
- **Database**: PostgreSQL (managed by Hasura)
- **Authentication**: JWT-based authentication

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

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Expo Go app on your mobile device (for Expo development)
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
# or
yarn install
```

### Running with Expo

The easiest way to run the app during development is with Expo:

```bash
# Start Expo development server
npm run expo

# Run on Android
npm run expo:android

# Run on iOS
npm run expo:ios

# Run on web
npm run expo:web
```

When you run `npm run expo`, Expo will generate a QR code that you can scan with your phone's camera (iOS) or the Expo Go app (Android) to open the app on your device.

### Running with React Native CLI

You can also run the app using the React Native CLI:

```bash
# Start the Metro bundler
npm start

# Run on Android
npm run android

# Run on iOS
npm run ios
```

### Setting up Hasura Backend

1. Start Hasura using Docker:
```bash
cd hasura
docker-compose up -d
```

2. Apply migrations:
```bash
hasura migrate apply
```

3. Apply metadata:
```bash
hasura metadata apply
```

4. Seed the database:
```bash
hasura seed apply
```

## Development Roadmap

This project follows the development roadmap outlined in the [DevelopmentTree.md](./DevelopmentTree.md) file, which includes:

1. React Native Project Setup
2. Backend Infrastructure with Hasura
3. Authentication Integration
4. Apollo Client Integration
5. Feature Implementation
6. Mobile-Specific Features
7. Performance Optimization and Deployment

## Current Status

The project is transitioning from using mock data to integrating with a Hasura GraphQL backend. The basic structure, UI components, and navigation are in place, with ongoing work to implement real data fetching and authentication.

## License

This project is licensed under the MIT License.

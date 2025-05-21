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

## Project Structure

- `/src`: Main source code directory
  - `/components`: Reusable UI components
  - `/screens`: Application screens
  - `/navigation`: Navigation configuration
  - `/hooks`: Custom React hooks
  - `/services`: API and backend services
  - `/utils`: Helper functions
  - `/assets`: Images, fonts, etc.
  - `/types`: TypeScript type definitions
  - `/constants`: App constants

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- React Native development environment set up

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

3. Start the Metro bundler:
```bash
npm start
# or
yarn start
```

4. Run the app on Android or iOS:
```bash
npm run android
# or
npm run ios
```

## Development Roadmap

This project follows the development roadmap outlined in the [DevelopmentTree.md](../Next-Gig-App/DevelopmentTree.md) file, which includes:

1. React Native Project Setup
2. Backend Infrastructure with Hasura
3. Authentication Integration
4. Apollo Client Integration
5. Feature Implementation
6. Mobile-Specific Features
7. Performance Optimization and Deployment

## Current Status

The project is currently in the initial development phase, with the basic structure and UI components in place. The app uses mock data for development purposes, with plans to integrate with Hasura GraphQL backend in future iterations.

## License

This project is licensed under the MIT License.

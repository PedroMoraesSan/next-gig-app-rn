# NextGig App - Hasura Backend

This directory contains the Hasura GraphQL Engine configuration for the NextGig App.

## Getting Started

### Prerequisites

- Docker and Docker Compose
- Hasura CLI (optional, for migrations and metadata management)

### Running Hasura

1. Start the Hasura instance:

```bash
docker-compose up -d
```

2. Access the Hasura Console:

Open your browser and navigate to [http://localhost:8080/console](http://localhost:8080/console)

The admin secret is `nextgigadminsecret`

### Database Migrations

The database schema is managed through migrations. To apply migrations:

```bash
# Install Hasura CLI if you haven't already
npm install -g hasura-cli

# Apply migrations
hasura migrate apply --database-name default

# Apply metadata
hasura metadata apply

# Seed the database with sample data
hasura seed apply
```

## Database Schema

The database schema includes the following tables:

- `users`: User accounts
- `profiles`: User profile information
- `jobs`: Job listings
- `saved_jobs`: Jobs saved by users
- `applications`: Job applications submitted by users
- `job_alerts`: Job alerts created by users
- `notifications`: User notifications
- `device_tokens`: Device tokens for push notifications

## Authentication

The backend uses JWT-based authentication. The JWT secret is configured in the `docker-compose.yml` file.

## GraphQL API

The GraphQL API is available at `http://localhost:8080/v1/graphql`. You can explore the API using the Hasura Console.

## Permissions

The following roles are defined:

- `anonymous`: Public access (read-only for jobs)
- `user`: Authenticated user access
- `admin`: Administrative access (not configured in this setup)

## Environment Variables

The following environment variables are used:

- `HASURA_GRAPHQL_DATABASE_URL`: PostgreSQL connection URL
- `HASURA_GRAPHQL_ADMIN_SECRET`: Admin secret for Hasura Console access
- `HASURA_GRAPHQL_JWT_SECRET`: Secret for JWT verification

## Development Workflow

1. Make changes to the schema using the Hasura Console
2. Export the metadata and migrations:

```bash
hasura metadata export
hasura migrate create "migration_name" --from-server
```

3. Commit the changes to version control

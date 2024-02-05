# CodePair Service Backend

This project is the backend part of the CodePair service developed using NestJS.

## Getting Started

1. Navigate to the project directory.

    ```bash
    cd backend
    ```

2. Install dependencies.

    ```bash
    npm install
    ```

3. Start the server in development mode.

    ```bash
    npm run start:dev
    ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser to access the backend.

## Commands

### Building the Project:

```bash
npm run build
```

Builds the project.

### Linting the Code:

```bash
npm run lint
```

Lints TypeScript files using ESLint. Fixes any fixable linting errors.

### Testing:

```bash
npm test
```

Runs unit tests using Jest.

### Running in Production:

```bash
npm start
```

Starts the server in production mode.

## Directory Structure

```
backend/
├── docker/                               # Docker configuration files
│   ├── mongodb_replica/                  # Configuration for MongoDB replica set
│   │   ├── docker-compose.yml            # Docker Compose configuration for MongoDB replica set
│   │   └── Dockerfile                    # Dockerfile for MongoDB replica set
│   ├── docker-compose-full.yml           # Full Docker Compose configuration (Backend + MongoDB)
│   └── docker-compose.yml                # Default Docker Compose configuration
├── prisma/                               # Prisma configuration files
├── src/                                  # Source code
│   ├── admin/                            # Admin-related modules
│   ├── auth/                             # Authentication modules
│   ├── check/                            # Check-related modules
│   ├── db/                               # Database configuration
│   ├── documents/                        # Document-related modules
│   ├── intelligence/                     # Intelligence-related modules
│   ├── langchain/                        # Language chain modules
│   ├── users/                            # User-related modules
│   ├── utils/                            # Utility functions and types
│   ├── workspace-documents/              # Workspace document modules
│   ├── workspace-users/                  # Workspace user modules
│   └── workspaces/                       # Workspace modules
└── test/                                 # Test files
```

## Contributing

Please see the [CONTRIBUTING.md](../CONTRIBUTING.md) file for details on how to contribute to this project.
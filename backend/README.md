# CodePair Service Backend

This project is the backend part of the CodePair service developed using NestJS.

## Getting Started

1. Set Up GitHub OAuth Key

    For the Social Login feature, you need to obtain a GitHub OAuth key before running the project. Please refer to [this document](../docs/1_Set_Up_GitHub_OAuth_Key.md) for guidance.

    After completing this step, you should have the `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` values.

2. Update your `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` to `./backend/.env.development`.

    ```bash
    vi ./backend/.env.development

    # In the file, update the following values:
    # GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET
    GITHUB_CLIENT_ID=your_github_client_id_here
    GITHUB_CLIENT_SECRET=your_github_client_secret_here
    ```

3. Run `.backend/docker/docker-compose.yml`.

    ```bash
    docker-compose -f ./backend/docker/docker-compose.yml up -d
    ```

4. Install dependencies from the root.

    ```bash
    pnpm install
    ```

5. Run the Backend application:

    ```bash
    # In the root directory of the repository and run.
    pnpm backend start:dev
    ```

6. Visit http://localhost:3000 to enjoy your CodePair.

## API Specification

You can access the Swagger-based REST API specification at `<API_URL>/api` when the backend server is running.

## Commands

### Building the Project:

```bash
pnpm backend build
```

Builds the project.

### Linting the Code:

```bash
pnpm backend lint
```

Lints TypeScript files using ESLint. Fixes any fixable linting errors.

### Testing:

```bash
pnpm backend test
```

Runs unit tests using Jest.

### Running in Production:

```bash
pnpm backend start
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
If you are interested in internal design, please refer to the [Design Document](./design/).

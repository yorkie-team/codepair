# Directory Structure

This document explains the purpose and structure of the project's directories.

## Project Structure

```
backend-go/
├── api        # DTO definitions
├── bin        # Compiled binaries
├── cmd        # Application entry points
│   └── codepair  # Main application entry point (main.go)
├── design     # Design documents and architecture references
└── internal   # Core application logic (business logic, infrastructure, middleware)
```
### Structure of `internal`

``` 
internal
├── config        # Configuration loading & validation
├── core          # Business logic and domain entities
│   ├── workspace # Workspace management module
│   ├── user      # User management module
│   └── ...       # Other domain-specific modules
├── infra         # Infrastructure dependencies (DB, storage, external services)
│   ├── database  # Database integrations
│   │   └── mongo # MongoDB implementation
│   ├── storage   # Object storage (MinIO, S3, etc.)
│   │   ├── minio # MinIO storage implementation
│   │   └── s3    # AWS S3 storage implementation
│   └── yorkie    # Yorkie admin client implementation
├── middleware    # Shared middleware (logging, auth, etc.)
└── server        # Server setup, routing, and bootstrapping
```

### Explanation of Each Component

#### 1. `internal/config`

- Responsible for **loading and validating configurations** (e.g., using `viper` or `os.Getenv`).
- Contains separate configuration files for authentication, database, and other settings.

#### 2. `internal/core`

- Contains the **business logic and domain models**.
- Each domain (e.g., `workspace`, `user`) includes:
    - `model.go` → Defines entity structures (e.g., `User`, `Workspace`).
    - `repository.go` → Interface for database operations.
    - `service.go` → Implementation of business logic.
    - `handler.go` → Presentation layer handlers for processing HTTP requests.

#### 3. `internal/infra`

- Represents the **infrastructure layer** responsible for handling external dependencies such as databases, storage, and external services.
- Organized into:
    - `database/mongo/` → MongoDB implementation for repositories.
    - `storage/` → Object storage implementations (MinIO, S3).
    - `yorkie/` → Contains the Yorkie admin client, which handles administrative functions.

#### 4. `internal/middleware`

- Contains **shared middleware** applied across the application.
- Common middleware includes:
    - Logging
    - Authentication & authorization
    - Error handling & panic recovery
    - Request validation

#### 5. `internal/server`

- Handles **server setup and routing**.
- Includes:
    - `routes.go` → Defines API endpoints and middleware.
    - `server.go` → Initializes the server, sets up dependencies, and starts the application.

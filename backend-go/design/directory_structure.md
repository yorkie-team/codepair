# Directory Structure

This document explains the purpose and structure of the project's directories.

## Project Structure

```
project-root/
├── api        # API documentation & DTO definitions
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
├── domain        # Business logic and domain entities
│   ├── auth      # Authentication module
│   ├── user      # User management module
│   └── ...       # Other domain-specific modules
├── infra         # Infrastructure dependencies (DB, storage, external services)
│   ├── database  # Database integrations
│   │   └── mongo # MongoDB implementation
│   ├── storage   # Object storage (MinIO, S3, etc.)
│   │   ├── minio # MinIO storage implementation
│   │   └── s3    # AWS S3 storage implementation
│   └── yorkie    # Yorkie integration for collaborative editing
├── middleware    # Shared middleware (logging, auth, etc.)
└── server        # Server setup, routing, and bootstrapping
```

### Explanation of Each Component

#### 1. `internal/config`

- Responsible for **loading and validating configurations** (e.g., using `viper` or `os.Getenv`).
- Contains separate configuration files for authentication, database, and other settings.

#### 2. `internal/domain`

- **Core business logic and domain models** are defined here.
- Each domain (e.g., `auth`, `user`) contains:
    - `model.go` → Defines entity structures (e.g., `User`, `Workspace`).
    - `repository.go` → Interface for database operations.
    - `service.go` → Business logic implementation.
    - `handler.go` → HTTP handlers for request processing.

#### 3. `internal/infra`

- **Infrastructure layer** handling external dependencies like databases, storage, and external services.
- Organized into:
    - `database/mongo/` → MongoDB implementation for repositories.
    - `storage/` → Object storage implementations (MinIO, S3).
    - `yorkie/` → Yorkie API client for collaborative editing.

#### 4. `internal/middleware`

- **Shared middleware** applied across the application.
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


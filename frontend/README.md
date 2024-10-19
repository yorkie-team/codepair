# CodePair Service Frontend

This project is the frontend part of the CodePair service developed using Vite and React.

## Getting Started

1. Set Up GitHub OAuth Key

    For the Social Login feature, you need to obtain a GitHub OAuth key before running the project. Please refer to [this document](../docs/1_Set_Up_GitHub_OAuth_Key.md) for guidance.

    After completing this step, you should have the `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` values.

2. Update your `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` to `./backend/docker/docker-compose-full.yml`.

    ```bash
    vi ./backend/docker/docker-compose-full.yml

    # In the file, update the following values:
    # GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET
    GITHUB_CLIENT_ID: "your_github_client_id_here"
    GITHUB_CLIENT_SECRET: "your_github_client_secret_here"
    ```

3. Run `./backend/docker/docker-compose-full.yml`.

    ```bash
    docker-compose -f ./backend/docker/docker-compose-full.yml up -d
    ```

4. Install dependencies from the root.

    ```bash
    pnpm install
    ```

5. Run the Frontend application:

    ```bash
    # In the root directory of the repository and run.
    pnpm frontend dev
    ```

6. Visit [http://localhost:5173](http://localhost:5173) to enjoy your CodePair.

## Commands

### Running the Development Server:

```bash
pnpm frontend dev
```

Starts the development server using Vite.

### Building the Project:

```bash
pnpm frontend build
```

Compiles TypeScript files (`tsc`) and builds the project using Vite.

### Linting the Code:

```bash
pnpm frontend lint
```

Lints TypeScript and TypeScript React files using ESLint. Reports any linting errors or warnings.

### Previewing the Production Build:

```bash
pnpm frontend preview
```

Previews the production build of the project using Vite.

### Formatting the Code:

```bash
pnpm frontend format
```

Formats the code using Prettier according to project configurations. Automatically fixes any formatting issues.

### Checking Code Formatting:

```bash
pnpm frontend format:check
```

Checks if the code is formatted correctly according to Prettier configurations. Reports any formatting issues without fixing them.

## Directory Structure

```
frontend/
├── public/                 # Static files (index.html, images, etc.)
├── src/                    # Source code
│   ├── components/         # React components
│   ├── constants/          # Constants for project
│   ├── contexts/           # React contexts
│   ├── hooks/              # React hooks
│   │   └── api/            # Hooks for `react-query`
│   ├── pages/              # Page components
│   ├── providers/          # React providers
│   ├── utils/              # Utility functions, etc.
│   ├── store/              # Redux stores
│   ├── App.css             # Shared layout styles, theme settings, or common utility classes, etc.
│   ├── App.tsx             # App component entry point
│   ├── index.css           # Global styles for overall layout, font settings, basic colors, etc.
│   ├── main.tsx            # Main rendering entry point
│   ├── routes.tsx          # Routing settings
│   └── vite-env.d.ts       # Types for environment variables.
├── .env.example            # Example .env file with environment variable definitions
├── eslint.config.mjs       # ESLint configuration file in ES module format
├── .gitignore              # Git ignore settings file
├── .prettierignore         # Files and directories to ignore for Prettier formatting
├── .prettierrc             # Prettier configuration file
├── index.html              # HTML template file
├── package.json            # Project metadata and dependencies definition
├── README.md               # Project description file (this file)
├── tsconfig.json           # TypeScript configuration file
├── tsconfig.node.json      # TypeScript configuration file for Node.js environment
└── vite.config.ts          # Vite configuration file
```

## Contributing

Please see the [CONTRIBUTING.md](../CONTRIBUTING.md) file for details on how to contribute to this project.

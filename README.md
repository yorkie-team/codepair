# CodePair

<p align="center">
Build your own AI real-time collaborative markdown editor in just 5 minutes.
</p>

<p align="center">
    <a href="https://codepair.yorkie.dev/"><b>Website</b></a> •
    <a href="https://discord.com/invite/MVEAwz9sBy"><b>Discord</b></a>
</p>

<img width="1392" alt="스크린샷 2024-02-02 오후 4 35 29" src="https://github.com/yorkie-team/codepair-poc/assets/52884648/25c441ef-9ca4-4235-9969-279e1c56258b">

## Overview

CodePair is an open-source real-time collaborative markdown editor with AI intelligence, built using React, NestJS, and LangChain.

CodePair provides the following features:

- **Workspace**: A space where users can invite others and collaboratively edit documents
- **Sharing Document**: Share documents with external parties by setting permissions and expiration time
- **Yorkie Intelligence**: AI intelligence available within the collaborative editing editor

## Packages

This repository contains multiple packages that make up our project, organized as a pnpm workspace under `packages/`.

- **`@codepair/frontend`**: App shell — routing, auth, workspace, editor slot. See [packages/frontend/](packages/frontend/) for details.
- **`@codepair/backend`**: NestJS API server. See [packages/backend/README.md](packages/backend/README.md) for details.
- **`@codepair/codemirror`**: CodeMirror 6 editor with Yorkie sync, toolbar, preview. Self-contained vertical slice.
- **`@codepair/ui`**: Shared types (`EditorPort`, `EditorModeType`, `PresenceInfo`) and pure UI components.

## Node.js Version Support

- **Supported:** **20.x (LTS)**, **22.x (Active LTS)**, **24.x (Current)**
- **Dropped:** **18.x** (End-of-life)

## Getting Started with Development

### 1. Set Up GitHub OAuth Key

For the Social Login feature, you need to obtain a GitHub OAuth key before running the project. Please refer to [this document](./docs/1_Set_Up_GitHub_OAuth_Key.md) for guidance.

After completing this step, you should have the `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` values.

### 2. Choose Running Mode

We offer two options. Choose the one that best suits your needs:

- **Frontend Development Only Mode**: Use this option if you only want to develop the frontend.
- **Full Stack Development Mode**: Use this option if you want to develop both the frontend and backend together.

### 3-1. Frontend Development Only Mode

1. Update your `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` to `./packages/backend/docker/docker-compose-full.yml`.

   ```bash
   vi ./packages/backend/docker/docker-compose-full.yml

   # In the file, update the following values:
   # GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET
   GITHUB_CLIENT_ID: "your_github_client_id_here"
   GITHUB_CLIENT_SECRET: "your_github_client_secret_here"
   ```

2. Run `./packages/backend/docker/docker-compose-full.yml`.

   ```bash
   docker-compose -f ./packages/backend/docker/docker-compose-full.yml up -d
   ```

3. Install dependencies from the root.

   ```bash
   pnpm install
   ```

4. Run the Frontend application.

   ```bash
   pnpm frontend dev
   ```

5. Visit http://localhost:5173 to enjoy your CodePair.

### 3-2. Full Stack Development Mode

1. Update your `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` to `./packages/backend/.env.development`.

   ```bash
   vi ./packages/backend/.env.development

   # In the file, update the following values:
   # GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET
   GITHUB_CLIENT_ID=your_github_client_id_here
   GITHUB_CLIENT_SECRET=your_github_client_secret_here
   ```

2. Run `./packages/backend/docker/docker-compose.yml`.

   ```bash
   docker-compose -f ./packages/backend/docker/docker-compose.yml up -d
   ```

3. Install dependencies from the root.

   ```bash
   pnpm install
   ```

4. Set up the Yorkie webhook:

   ```bash
   pnpm setup:webhook
   ```

5. Run the Backend application and the Frontend application:

   ```bash
   pnpm backend start:dev
   pnpm frontend dev
   ```

6. Visit http://localhost:5173 to enjoy your CodePair.

## Contributing

See [CONTRIBUTING](CONTRIBUTING.md) for details on submitting patches and the contribution workflow.

## Contributors ✨

Thanks goes to these incredible people:

<a href="https://github.com/yorkie-team/codepair/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=yorkie-team/codepair" />
</a>

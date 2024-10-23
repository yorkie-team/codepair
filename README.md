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

This repository contains multiple packages/modules that make up our project. Each package/module is contained in its own directory within this repository.

- **Frontend**: Contains the frontend code of our application. Please refer to [frontend/README.md](frontend/README.md) for detailed information on setting up and running the frontend.
- **Backend**: Contains the backend code of our application. Please refer to [backend/README.md](backend/README.md) for detailed information on setting up and running the backend.

## Getting Started with Development

### 1. Set Up GitHub OAuth Key

For the Social Login feature, you need to obtain a GitHub OAuth key before running the project. Please refer to [this document](./docs/1_Set_Up_GitHub_OAuth_Key.md) for guidance.

After completing this step, you should have the `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` values.

### 2. Choose Running Mode

We offer two options. Choose the one that best suits your needs:

- **Frontend Development Only Mode**: Use this option if you only want to develop the frontend.
- **Full Stack Development Mode**: Use this option if you want to develop both the frontend and backend together.

### 3-1. Frontend Development Only Mode

1. Update your `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` to `./backend/docker/docker-compose-full.yml`.

   ```bash
   vi ./backend/docker/docker-compose-full.yml

   # In the file, update the following values:
   # GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET
   GITHUB_CLIENT_ID: "your_github_client_id_here"
   GITHUB_CLIENT_SECRET: "your_github_client_secret_here"
   ```

2. Run `./backend/docker/docker-compose-full.yml`.

   ```bash
   docker-compose -f ./backend/docker/docker-compose-full.yml up -d
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

1. Update your `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` to `./backend/.env.development`.

   ```bash
   vi ./backend/.env.development

   # In the file, update the following values:
   # GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET
   GITHUB_CLIENT_ID=your_github_client_id_here
   GITHUB_CLIENT_SECRET=your_github_client_secret_here
   ```

2. Run `./backend/docker/docker-compose.yml`.

   ```bash
   docker-compose -f ./backend/docker/docker-compose.yml up -d
   ```

3. Install dependencies from the root.

   ```bash
   pnpm install
   ```

4. Run the Backend application and the Frontend application:

   ```bash
   pnpm backend start:dev
   pnpm frontend dev
   ```

5. Visit http://localhost:5173 to enjoy your CodePair.

## Contributing

See [CONTRIBUTING](CONTRIBUTING.md) for details on submitting patches and the contribution workflow.

## Contributors ✨

Thanks goes to these incredible people:

<a href="https://github.com/yorkie-team/codepair/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=yorkie-team/codepair" />
</a>

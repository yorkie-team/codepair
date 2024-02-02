# CodePair

Build your own AI real-time collaborative markdown editor in just 5 minutes.

## Overview

CodePair is an open-source real-time collaborative markdown editor with AI intelligence, built using React, NestJS, and LangChain.

CodePair provides the following features:

- **Workspace**: A space where users can invite others and collaboratively edit documents
- **Sharing Document**: Share documents with external parties by setting permissions and expiration time
- **Yorkie Intelligence**: AI intelligence available within the collaborative editing editor

## Getting Started (Development Mode)


1. Run the Dockerfile for MongoDB, the database used by CodePair:
    ```
    docker-compose up -f ./backend/docker/mongodb_replica/docker-compose.yml -d
    ```

2. Run the Backend application:
    ```
    cd backend
    npm install
    npm run start:dev
    ```

3. Run the Frontend application:
    ```
    cd frontend
    npm install
    npm run dev
    ```

4. Visit http://localhost:5173 to enjoy your CodePair.

## Contributors ✨

Thanks goes to these incredible people:

<a href="https://github.com/yorkie-team/codepair/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=yorkie-team/codepair-poc" />
</a>
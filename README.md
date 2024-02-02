# CodePair

<img width="1392" alt="스크린샷 2024-02-02 오후 4 35 29" src="https://github.com/yorkie-team/codepair-poc/assets/52884648/25c441ef-9ca4-4235-9969-279e1c56258b">


Build your own AI real-time collaborative markdown editor in just 5 minutes.

## Overview

CodePair is an open-source real-time collaborative markdown editor with AI intelligence, built using React, NestJS, and LangChain.

CodePair provides the following features:

- **Workspace**: A space where users can invite others and collaboratively edit documents
- **Sharing Document**: Share documents with external parties by setting permissions and expiration time
- **Yorkie Intelligence**: AI intelligence available within the collaborative editing editor

## Getting Started (Development Mode)

### Configuration and Setup

Before running the Frontend and Backend applications, you need to fill in the required API Keys.

Follow these steps:

**Frontend Environment Configuration**

1. Navigate to the `frontend` directory.
   
   ```
   cd frontend
   ```
2. Fill in each Key field with the appropriate value in `.env.development`. Refer to the following links to obtain the necessary Key values.
   - [Create Yorkie Project](https://yorkie.dev/)

**Backend Environment Configuration**

1. Navigate to the `backend` directory.
   
   ```
   cd backend
   ```
2. Fill in each Key field with the appropriate value in `.env`. Refer to the following links to obtain the necessary Key values.
   - [Create Yorkie Project](https://yorkie.dev/)
   - [Create GitHub OAuth App](https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/creating-an-oauth-app)
   - [Create OpenAI API Key](https://help.openai.com/en/articles/4936850-where-do-i-find-my-api-key)
   - [Create LangSmith API Key](https://www.langchain.com/langsmith)

### Run Application

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

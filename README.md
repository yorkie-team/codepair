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

## Getting Started with Development

### Configuration and Setup

Before running the Frontend and Backend applications, you need to fill in the required API Keys.  
Follow these steps:

**Frontend Environment Configuration**

1. Navigate to the `frontend` directory.
   
   ```bash
   cd frontend
   ```
2. Copy the `.env.example` file to create a `.env.development` file.
   ```bash
   cp .env.example .env.development
   ```
3. Edit the `.env.development` file and fill in the necessary environment variable values. Refer to the comments for the meaning and examples of each value.

**Backend Environment Configuration**

1. Navigate to the `frontend` directory.
   
   ```bash
   cd backend
   ```
2. Copy the `.env.example` file to create a `.env.development` file.
   ```bash
   cp .env.example .env.development
   ```
3. Edit the `.env.development` file and fill in the necessary environment variable values. Refer to the comments for the meaning and examples of each value.
   
### Run Application

1. Run the Dockerfile for MongoDB, the database used by CodePair:
   
    ```bash
    docker-compose up -f ./backend/docker/mongodb_replica/docker-compose.yml -d
    ```

2. Run the Backend application:
   
    ```bash
    cd backend
    npm install
    npm run start:dev
    ```

3. Run the Frontend application:
   
    ```bash
    cd frontend
    npm install
    npm run dev
    ```

4. Visit http://localhost:5173 to enjoy your CodePair.

## Contributing

See [CONTRIBUTING](CONTRIBUTING.md) for details on submitting patches and the contribution workflow.

## Contributors ✨

Thanks goes to these incredible people:

<a href="https://github.com/yorkie-team/codepair/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=yorkie-team/codepair" />
</a>

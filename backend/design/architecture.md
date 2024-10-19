# Backend Architecture

This document covers the architecture of CodePair's NestJS backend.

## Architecture

Below is the diagram of the CodePair Backend Architecture. Currently, it adheres to the default architecture that can be generated through [NestJS CLI](https://docs.nestjs.com/cli/overview).  
If you want to add a new component, you can use the command `nest generate controller [CONTROLLER_NAME]`.

```
                CodePair Backend
 ┌───────┐      ┌──────────────────────────────────────────────────────────────────────┐
 │Request├─────►│                                                                      │
 └───────┘      │  ┌────┐     ┌─────┐     ┌──────────┐     ┌───────┐     ┌──────────┐  │
                │  │Pipe│────►│Guard│────►│Controller│────►│Service│────►│Repository│  │
┌────────┐      │  └────┘     └─────┘     └──────────┘     └───────┘     └──────────┘  │
│Response│◄─────┤                                                                      │
└────────┘      └──────────────────────────────────────────────────────────────────────┘

```

-   Pipe: Handles data transformation/validation in the request/response pipeline.
-   Guard: Implements access control and validation logic for routes.
-   Controller: Defines the endpoints/routes and their corresponding request handling logic.
-   Service: Contains the business logic and performs operations required by the application.
-   Repository: Handles data persistence and retrieval operations from the data source.

Note that the naming for the Repository Layer is `PrismaService`.

## Note

For now, we are using the architecture recommended by NestJS as a reference.  
However, in the future, we can evolve towards implementing Clean Architecture by introducing interfaces between each layer.

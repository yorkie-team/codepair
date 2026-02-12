# Redux & React Query Structure

This document covers the structure of `redux` & `react-query`.  
CodePair uses redux and react-query as state management tools. This document compares their use cases and roles.

## [Redux](https://redux-toolkit.js.org/)

Redux is utilized for storing globally used data such as user tokens and theme modes. In cases where data is not globally used in the project but is utilized by one or more sub-components, it is stored in Redux. The code for the Redux store can be found in [`../src/store`](../src/store/).

## [React Query](https://tanstack.com/query/v3/)

React Query is utilized for managing API calls and their resulting states. It inherently employs internal caching for state management. When data is needed in sub-components, the implementation avoids using cached results and instead stores the results of API calls in Redux. To prevent duplicate calls, sub-components refrain from directly invoking React Query and calls are made exclusively from the page level. The React Query hook used in this project can be found in [`../src/hooks/api`](../src/hooks/api/).

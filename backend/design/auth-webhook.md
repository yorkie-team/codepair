# Yorkie Auth Webhook

This document covers the structure of the Auth Webhook to prevent users from accessing unauthorized documents using a Public Key.

## What is Yorkie Auth Webhook?

A webhook is an HTTP POST that is called when something happens. If the Auth Webhook has been configured, when a Server receives a request from a Client, the Server checks if the Client has been authorized for a certain Document by asking an outside service with a REST request.

-   [Yorkie Auth Webhook](https://yorkie.dev/docs/cli#auth-webhook)

In a production environment, it is strongly recommended to enable the Auth Webhook.

## Overall Flow

```
(5) response the request  (4) handle the request
     ┌─────────────────┐  ┌──┐
     │                 │  │  │  (3) response
     ▼                 │  ▼  │    - allowed
 ┌──────┐             ┌┴─────┤    - reason   ┌───────────────┐
 │Client├────────────►│Yorkie│◄──────────────┤CodePair Server│
 └──────┘ (1)request  └────┬─┘               └───────────────┘
           - token         │                      ▲
           - dockey        └──────────────────────┘
                               (2) call webhook
                                - token
                                - dockey
                                - verb: r or rw
```

**Webhook URL**: `<BACKEND_URL>/check/yorkie`  
**Token Format**: `share:<SHARE_TOKEN>` or `default:<ACCESS_TOKEN>`

## Set Up

The code related to AuthWebhook is already implemented in [`useYorkieDocument`](../../frontend/src/hooks/useYorkieDocument.ts) and [`check.controller.ts`](../src/check/check.controller.ts).  
Simply visit the Yorkie Project Dashboard and add `<YOUR_BACKEND_URL>/check/yorkie` to the Settings > Webhook > Auth webhook URL.

Note that if `YOUR_BACKEND_URL` is `http://localhost` and Yorkie is not running on `http://localhost`, this will not work.

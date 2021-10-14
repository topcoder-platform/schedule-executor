# Schedule Executor

This module sets up the state machine and lambda functions to process events. This module is responsibile for actually executing the api calls registered with the [Schedule API](https://github.com/topcoder-platform/scheduler-api). The registration of the events has to be done through the API. This executor only runs the events after they have been registered.

## Development status

[![Total alerts](https://img.shields.io/lgtm/alerts/g/topcoder-platform/schedule-executor.svg?logo=lgtm&logoWidth=18)](https://lgtm.com/projects/g/topcoder-platform/schedule-executor/alerts/)[![Language grade: JavaScript](https://img.shields.io/lgtm/grade/javascript/g/topcoder-platform/schedule-executor.svg?logo=lgtm&logoWidth=18)](https://lgtm.com/projects/g/topcoder-platform/schedule-executor/context:javascript)

### Deployment status

Dev: [![CircleCI](https://circleci.com/gh/topcoder-platform/schedule-executor/tree/develop.svg?style=svg)](https://circleci.com/gh/topcoder-platform/schedule-executor/tree/develop) Prod: [![CircleCI](https://circleci.com/gh/topcoder-platform/schedule-executor/tree/master.svg?style=svg)](https://circleci.com/gh/topcoder-platform/schedule-executor/tree/master)

## Requirements

- node v10

## Environment Variables

- `AUTH0_URL`: AUTH0 URL, used to get M2M token
- `AUTH0_AUDIENCE`: AUTH0 audience, used to get M2M token
- `TOKEN_CACHE_TIME`: AUTH0 token cache time, used to get M2M token
- `AUTH0_CLIENT_ID`: AUTH0 client id, used to get M2M token
- `AUTH0_CLIENT_SECRET`: AUTH0 client secret, used to get M2M token

## Deploy
- Make sure to use Node v10+ by command `node -v`. We recommend using [NVM](https://github.com/nvm-sh/nvm) to quickly switch to the right version:

   ```bash
   nvm use
   ```
- In the `scheduler-executor` root directory create `.env` file with the next environment variables. Values for **Auth0 config** should be shared with you on the forum.<br>
   ```bash
   # Auth0 config
   AUTH0_URL=
   AUTH0_AUDIENCE=
   TOKEN_CACHE_TIME=
   AUTH0_CLIENT_ID=
   AUTH0_CLIENT_SECRET=

   ```
    - Values from this file would be automatically used by `npm` commands.
    - ⚠️ Never commit this file or its copy to the repository!
```bash
npm install
npm run deploy
```

## Destory instances

Run `npm run destroy` to clean up AWS resources.

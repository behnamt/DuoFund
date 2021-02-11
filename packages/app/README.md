## Prerequisites
### Metamask extension
- Install Metamask extension on your favorite browser
- Create your wallet
- Add a new network: click on the networks dropdown and Add a new RPC
  - NetworkName: Ganache. RPC URL: http://127.0.0.1:7745, ChainID: 5778
- Select the new network
- Import an account
  - use the [docker services](../README.md#docker_services) to obtain one private key and import using private key
- use this account to interact with the app

### Bing Maps API key
Obtain an API key to connect to Bing maps and set it as `REACT_APP_BING_API_KEY` value in `app/.env.local`
## Available Scripts

In the project directory, you can run:

### `yarn start`

Runs the app in the development mode.<br />
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br />
You will also see any lint errors in the console.

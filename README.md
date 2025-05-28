# snet-sdk-web

![npm](https://img.shields.io/npm/v/snet-sdk-web.svg)

SingularityNET SDK for Browser (Web)

## Getting Started
This package snet-sdk-web provides browser-compatible tools for interacting with the SNET SDK. It is built on top of the snet-sdk-core, extending its functionality to support web-specific environments.

The SNET JS SDK consists of three packages:

- `core` – The main SDK functionality.
- `nodeJS` – Node.js-specific implementations.
- **`web` – Web (browser) integrations.**

These instructions are for the development and use of the SingularityNET SDK for JavaScript on web platform like browsers.

### Installation

```bash
npm install snet-sdk-web
```

| Enviroment | Version |
| -------| --------------- |
| Node.js | >= 18  |
| react-scripts | >= 5.0.1  |


If you are using `create-react-app` then require Node.js polyfills for browser compatibility. To add these polyfills, you can use the `config-overrides.js` file with `react-app-rewired`. This approach allows you to customize the Webpack configuration without ejecting from `create-react-app`.

Install **react-app-rewired** into your application

```bash
npm install --save-dev react-app-rewired
```

Install the necessary polyfill packages

```bash
npm install --save-dev buffer process os-browserify url
```

Create **config-overrides.js** in the root of your project with the content:

```javascript
const webpack = require("webpack");

module.exports = function override(config) {
  const fallback = config.resolve.fallback || {};
  Object.assign(fallback, {
    os: require.resolve('os-browserify'),
    url: require.resolve('url'),
    path: require.resolve('path-browserify'),
    fs: require.resolve('fs'),
  });
  config.resolve.fallback = fallback;
  config.plugins = (config.plugins || []).concat([
    new webpack.ProvidePlugin({
      process: "process/browser",
      Buffer: ["buffer", "Buffer"],
    }),
  ]);
  config.ignoreWarnings = [/Failed to parse source map/];
  config.module.rules.push({
    test: /\.(js|mjs|jsx)$/,
    enforce: "pre",
    loader: require.resolve("source-map-loader"),
    resolve: {
      fullySpecified: false,
    },
  });
  return config;
};
```

Update your **package.json** scripts to use **react-app-rewired** instead of **react-scripts**.

```json
{
  "scripts": {
    "start": "react-app-rewired start",
    "build": "react-app-rewired build",
    "test": "react-app-rewired test",
    "eject": "react-scripts eject"
  }
}
```

### Usage

The SingularityNET SDK allows you to import compiled client libraries for your service or services of choice and make calls to those services programmatically from your application by setting up state channels with the providers of those services and making gRPC calls to the SingularityNET daemons for those services by selecting a channel with sufficient funding and supplying the appropriate metadata for authentication.

```javascript
import SnetSDK from "snet-sdk-web";
import config from "./config";

const sdk = new SnetSDK(config);
```

You can find a sample config below

```json
{
  "web3Provider": window.ethereum,
  "networkId": "11155111",
  "ipfsEndpoint": "http://ipfs.organization.io:80",
  "defaultGasPrice": "4700000",
  "defaultGasLimit": "210000",
  "tokenName": "FET",
}

```

All config fields:
| **Key**            | **Description**                                                                           |
|--------------------|-------------------------------------------------------------------------------------------|
| `web3Provider`     | The URL of the Web3 provider, used to interact with the Ethereum network.|
| `privateKey`       | The private key of the Ethereum account used for signing transactions. Must start with 0x |
| `networkId`        | The ID of the Ethereum network to connect to. (1 for Mainnet or 11155111 for Sepolia)|
| `ipfsEndpoint`     | The optional parameter. The endpoint for connecting to an SingularityNet IPFS node|
| `logLevel`        | The optional parameter, `info` by default. Can be -	`debug`, `error`, `info` |
| `rpcEndpoint`     | It is the optional field, you should provide this if you are getting block size limit exceeded error. This is usually happens when you are using any web social auth providers.|
| `defaultGasPrice`  | The gas price (in wei) to be used for transactions.|
| `defaultGasLimit`  | The gas limit to be set for transactions.|
| `tokenName`  | The name of the token which will be used. It can assume the values `FET` and `AGIX`. |
| `standType`  | This attribute for test networks can assume the values `demo`, `dev`, and for Mainnet, it can take on the values `prod` |

**Debugging Tip:** To view debug logs, enable verbose mode in your browser's developer console.

Now, the instance of the sdk can be used to instantiate clients for SingularityNET services. To interact with those services, the sdk needs to be supplied with the compiled gRPC client libraries.

This SDK uses [gRPC-web](https://github.com/improbable-eng/grpc-web) by improbable engineering. To generate the gRPC client libraries, follow the instructions given by the `gRPC-web` package [here](https://github.com/improbable-eng/grpc-web/tree/master/client/grpc-web).

The api to invoke gRPC methods against a service is similar to that of the `gRPC-web` package used.

```javascript

import { <ServiceName> } from  '<path_to_grpc_service_file>'
import { <Message> } from  '<path_to_grpc_message_file>'

const  client = sdk.createServiceClient({orgId: "<org_id>", serviceId: "<service_id>"})

```

This generates a service client which can be used to make gRPC calls to the desired service.
You can then invoke service specific calls as follows

```javascript
client.invoke(<ServiceName>.<MethodName>, <InvokeRpcOptions>);
```

More details about can be found on the official [documentation](https://github.com/improbable-eng/grpc-web/blob/master/client/grpc-web/docs/invoke.md#invokerpcoptions).

---

## WEBSDK SETUP LOCALLY

To set up and link snet-sdk-web locally for development or testing, follow these steps:

1. Clone and Build the SDK
Clone the repository:
```bash
git clone https://github.com/singnet/snet-sdk-web.git
```

2. Install dependencies and build:

```bash
npm install
npm run build
```

3. Link the package globally (to use it in other projects):
```bash
npm link
```

or use next string in your package.json file:
```bash
"snet-sdk-web": "file:<path to snet-sdk-web parent folder>/snet-sdk-web/dist"
```

4. Start your project to test the changes:

```bash
npm run start
```

#### ⚠️ Important Note
If you make changes to the `snet-sdk-web` code rebuild the package:

```bash
npm run build
```

### Versioning

We use [SemVer](http://semver.org/) for versioning. For the versions available, see the
[tags on this repository](https://github.com/singnet/snet-sdk-js/tags).

## License

This project is licensed under the MIT License - see the
[LICENSE](https://github.com/singnet/snet-sdk-js/blob/master/LICENSE) file for details.

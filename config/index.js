var mongo_uri = process.env.REDIFLOW_MONGO_URI;

module.exports = {
  httpServerPort: 5097,
  mongo: {
    uri: mongo_uri
  },
  supportedNetworkIds: {
    1: true,
    5: true,
    137: true,
    80001: true,
  },
  jwt: {
      metaMaskMessage: 'I agree with the terms and conditions. Please sign me in.',
      jwtSecret: process.env.REDIFLOW_jwtSecret,
      tokenExpires: '60m'
  },
  api: {
    livepeer: {
      key: process.env.REDIFLOW_livepeer_apikey,
      webhookId: process.env.REDIFLOW_livepeer_webhookId,
      webhookSecret: process.env.REDIFLOW_livepeer_webhookSecret,
    },
  },
  network: {
    1: {
      id: 1,
      name: 'Ethereum Mainnet',
    },
    5: {
      id: 5,
      name: 'Goerli Testnet',
    },
    137: {
      id: 137,
      name: 'Polygon Mainnet',
    },
    80001: {
      id: 80001,
      name: 'Polygon Mumbai',
    }    
  },

};

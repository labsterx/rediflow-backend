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
  featuredVideos: [
    "1768e0ec-f067-48b7-acf0-ba8e5163bdc4", 
    "564831c9-6764-4da5-ac73-80d90e76f87c", 
    "4b0999cc-fd04-44b6-9c0c-0eda31e7818a", 
    "311e7965-4bc6-4566-a1b0-7f38a23e4fb2",
    "9d2e0ffa-ba2c-4267-a9ec-9fafc90a3558",
    "7143993d-baf9-4577-afe0-799dbaeb1897",
  ],
  network: {
    1: {
      id: 1,
      name: 'Ethereum Mainnet',
      superfluidSubgrahApiURL: 'https://subgraph.satsuma-prod.com/c5br3jaVlJI6/superfluid/eth-mainnet/api',
    },
    5: {
      id: 5,
      name: 'Goerli Testnet',
      superfluidSubgrahApiURL: 'https://api.thegraph.com/subgraphs/name/superfluid-finance/protocol-v1-goerli',
    },
    137: {
      id: 137,
      name: 'Polygon Mainnet',
      superfluidSubgrahApiURL: 'https://api.thegraph.com/subgraphs/name/superfluid-finance/protocol-v1-matic',
    },
    80001: {
      id: 80001,
      name: 'Polygon Mumbai',
      superfluidSubgrahApiURL: 'https://api.thegraph.com/subgraphs/name/superfluid-finance/protocol-v1-mumbai',
    }    
  },

};

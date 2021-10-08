require("@nomiclabs/hardhat-ethers");
require("hardhat-gas-reporter");
require("hardhat-abi-exporter");


const fs = require('fs');
const privateKey = fs.readFileSync(".secret").toString().trim();
module.exports = {
  // defaultNetwork: "matic",
  networks: {
    hardhat: {
    },
    mumbai: {
      url: "https://rpc-mumbai.maticvigil.com",
      accounts: [privateKey],
      gas: 5500000,
      gasPrice: 7000000000
    },
    matic: {
      url: "https://rpc-mainnet.maticvigil.com/v1/91e04c9de653d3c2e1432728063200e097215465",
      accounts: [privateKey],
      gasPrice: 50000000000
    }
  },
  solidity: {
    version: "0.8.0",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  },
  mocha: {
    timeout: 20000
  },
  gasReporter: {
    enabled: true
  },
  abiExporter: {
    path: './data/abi',
    clear: true,
    flat: true,
    spacing: 2,
    pretty: false
  }
}
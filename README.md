# Badgeth Contracts

This project allows an oracle (contract deployer) to award NFTs on Polygon

## Features
* BadgeFactory contract deploys Badge contracts for owner
* BadgeFactory contract awards badges specified by owner
* BadgeFactory contract allows whitelisted addresses to burn badges
* BadgeFactory contract allows whitelisted addresses to revoke their privileges


## Requirements
1. Store your private key in a .secret file
2. run ```npm install``` from the project's root directory
3. To deploy on Polygon mainnet, include a .matic-vigil-key file with your Matic Vigil API key: https://maticvigil.com

## Utilities
* run scripts: ```node scripts/deploy-and-mint.js```
* run tests: ```npx hardhat test```
* interact with contracts directly: ```npx hardhat console```

## Networks
#### networks are defined in ```hardhat.config.js``` along with a default network
* hardhat
  * a local network great for testing
* mumbai
  * test MATIC required https://faucet.polygon.technology
* matic
  * MATIC token and .matic-vigil-key required for interacting with Polygon mainnet
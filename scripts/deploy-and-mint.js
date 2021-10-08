// deploys BadgeFactory, creates a new Badge, and mints a single NFT to BADGE_WINNER_ACCOUNT

const { ethers } = require("hardhat");

const BADGE_DEPLOYMENT_SUBGRAPH_ID = "0x021c1a1ce318e7b4545f6280b248062592b71706";
const BADGE_DEPLOYMENT_NAME = "The Original ZeNFT";
const BADGE_DEPLOYMENT_SYMBOL = "ZEN";

const BADGE_CONTRACT_NAME = "Badge";
const BADGE_FACTORY_CONTRACT_NAME = "BadgeFactory";


const BADGE_STRUCT = {
  winner: "0x7d0277Baa5037dE6749B4c0Ff44Adf6EBcBd31D8",
  badgeId: 1,
  tokenURI: "ipfs://QmXdQXhk6jKRWwHizV6YtVqTUMNgQqGmHJF5sG6od4kWCc"
}

async function main() {
  const badgeFactoryContract = await deployBadgeFactory();

  await badgeFactoryContract.deployBadgeContract(
    BADGE_DEPLOYMENT_SUBGRAPH_ID,
    BADGE_DEPLOYMENT_NAME,
    BADGE_DEPLOYMENT_SYMBOL
  );

  await badgeFactoryContract.awardBadge(
    BADGE_DEPLOYMENT_SUBGRAPH_ID,
    BADGE_DEPLOYMENT_NAME,
    BADGE_STRUCT
  );

  const badgeAddress = await badgeFactoryContract.getBadge(BADGE_DEPLOYMENT_SUBGRAPH_ID, BADGE_DEPLOYMENT_NAME);
  console.log("Badge contract deployed at " + badgeAddress);

  const badgeContractFactory = await ethers.getContractFactory(BADGE_CONTRACT_NAME);
  const badgeContract = await badgeContractFactory.attach(badgeAddress);
  const balance = await badgeContract.balanceOf(BADGE_STRUCT.winner);
  console.log("Balance of " + BADGE_STRUCT.winner + " is " + balance);

  console.log("Badge minting complete");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

async function deployBadgeFactory() {
  const BadgeFactory = await ethers.getContractFactory(BADGE_FACTORY_CONTRACT_NAME);
  const badgeFactory = await BadgeFactory.deploy();
  await badgeFactory.deployed();
  return badgeFactory;
}
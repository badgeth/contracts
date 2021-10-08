const { ethers } = require("hardhat");

const BADGE_CONTRACT_NAME = "Badge";
const BADGE_CONTRACT_ADDRESS = "0x657140fd98a4487a34a656b87bce420d1ce01f30";
const BADGE_WINNER_ADDRESS = "0x7d0277baa5037de6749b4c0ff44adf6ebcbd31d8";


async function main() {
    const badgeContractFactory = await ethers.getContractFactory(BADGE_CONTRACT_NAME);
    const badgeContract = await badgeContractFactory.attach(BADGE_CONTRACT_ADDRESS);

    const balance = await badgeContract.balanceOf(BADGE_WINNER_ADDRESS);
    console.log("balance: " + balance);

    const tokenURI = await badgeContract.tokenURI(2);
    console.log("tokenURI: " + tokenURI);



  
    console.log("Badge minting complete");
  }
  
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
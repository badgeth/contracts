const hre = require("hardhat"); //import the hardhat

async function main() {
    const [deployer] = await ethers.getSigners(); //get the account to deploy the contract

    console.log("Deploying contracts with the account:", deployer.address); 

    const subgraphControllerContractFactory = await hre.ethers.getContractFactory("EmblemSubgraphController"); // Getting the Contract
    const subgraphControllerContract = await subgraphControllerContractFactory.deploy(); //deploying the contract

    await subgraphControllerContract.deployed(); // waiting for the contract to be deployed
    await subgraphControllerContract.postMerkleRoot(
        "0xeabf51cf6ab164ce7ac45f5d39f34aa296bf85a468171783b8ceabfc56331387",
        0,
        256
    );
    await subgraphControllerContract.createBadgeDefinition(2, 4);

  console.log("EmblemSubgraphController deployed to:", subgraphControllerContract.address); // Returning the contract address on the rinkeby
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); // Calling the function to deploy the contract 
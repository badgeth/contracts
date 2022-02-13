const hre = require("hardhat");
const EMBLEM_SUBGRAPH_CONTROLLER_CONTRACT_NAME = "EmblemSubgraphController";
const GOERLI_CHECKPOINT_MANAGER = "0x2890bA17EfE978480615e330ecB65333b880928e";
const GOERLI_FX_ROOT = "0x3d1d3E34f7fB6D26245E6640E1c50710eFFf15bA";
const MAINNET_CHECKPOINT_MANAGER = "0x86e4dc95c7fbdbf52e33d563bbdb00823894c287";
const MAINNET_FX_ROOT = "0xfe5e5D361b2ad62c541bAb87C45a0B9B018389a2";

async function main() {
    const subgraphControllerContract = await deploySubgraphControllerContract();
    console.log("EmblemSubgraphController contract deployed to " + subgraphControllerContract.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

async function deploySubgraphControllerContract() {
    const subgraphControllerContractFactory = await ethers.getContractFactory(EMBLEM_SUBGRAPH_CONTROLLER_CONTRACT_NAME);
    const subgraphControllerContract = await subgraphControllerContractFactory.deploy(GOERLI_CHECKPOINT_MANAGER, GOERLI_FX_ROOT);
    // const subgraphControllerContract = await subgraphControllerContractFactory.deploy(MAINNET_CHECKPOINT_MANAGER, MAINNET_FX_ROOT);
    await subgraphControllerContract.deployed();
    return subgraphControllerContract;
}
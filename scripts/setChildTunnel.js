const { ethers } = require("hardhat");

const EMBLEM_SUBGRAPH_CONTROLLER_CONTRACT_NAME = "EmblemSubgraphController";
// const EMBLEM_SUBGRAPH_CONTROLLER_ADDRESS = "0x36E8479FF502f4C56CF72525179Fb661B5CA12cf";
const EMBLEM_SUBGRAPH_CONTROLLER_ADDRESS = "0x41781777f9F29e7F4840e5E4a531Cb2817Aa009c";
const EMBLEM_REGISTRY_ADDRESS = "0x1990000bc84e1C1D4508F714EFb40adeb2E23708"



async function main() {
    const subgraphControllerContractFactory = await ethers.getContractFactory(EMBLEM_SUBGRAPH_CONTROLLER_CONTRACT_NAME);
    const subgraphControllerContract = await subgraphControllerContractFactory.attach(EMBLEM_SUBGRAPH_CONTROLLER_ADDRESS);
    console.log("Attached to SubgraphControllerContract at " + subgraphControllerContract.address);

    await subgraphControllerContract.setFxChildTunnel(EMBLEM_REGISTRY_ADDRESS);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });


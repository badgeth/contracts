const EMBLEM_SUBGRAPH_CONTROLLER_CONTRACT_NAME = "EmblemSubgraphController";
const EMBLEM_SUBGRAPH_CONTROLLER_ADDRESS = "0x41781777f9F29e7F4840e5E4a531Cb2817Aa009c";

const BADGE_METRIC = 2;
const BADGE_THRESHOLD_VALUE = 4;

async function main() {
    const subgraphControllerContractFactory = await ethers.getContractFactory(EMBLEM_SUBGRAPH_CONTROLLER_CONTRACT_NAME);
    const subgraphControllerContract = await subgraphControllerContractFactory.attach(EMBLEM_SUBGRAPH_CONTROLLER_ADDRESS);
    console.log("Attached to SubgraphControllerContract at " + subgraphControllerContract.address);

    await subgraphControllerContract.createBadgeDefinition(BADGE_METRIC, BADGE_THRESHOLD_VALUE);
    console.log("BadgeDefinition created with metric: " + BADGE_METRIC + " and threshold: " + BADGE_THRESHOLD_VALUE);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
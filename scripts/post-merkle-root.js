const { ethers } = require("hardhat");
const { MerkleTree } = require('merkletreejs')
const keccak256 = require('keccak256')
const { gql, request, GraphQLClient } = require("graphql-request");

const EMBLEM_SUBGRAPH_CONTROLLER_CONTRACT_NAME = "EmblemSubgraphController";
const EMBLEM_SUBGRAPH_CONTROLLER_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

const EMBLEM_GQL_ENDPOINT = "https://api.studio.thegraph.com/query/2486/test/2.1.6";
const EMBLEM_EARNED_BADGE_COUNT_QUERY = gql`
    query getMerkleLeaves($startingIndex: Int, $treeSize: Int) {
        earnedBadgeCounts(first: $treeSize, skip: $startingIndex, orderBy: globalBadgeNumber) {
            earnedBadge {
                badgeWinner {
                    id
                }
                definition {
                    badgeDefinitionNumber
                }
            }
        }
    }`


async function main() {
    const client = new GraphQLClient(EMBLEM_GQL_ENDPOINT);
    const merkleRoot = await merkleRootForEarnedBadgeCountRange(0, 256, client);

    const subgraphControllerContractFactory = await ethers.getContractFactory(EMBLEM_SUBGRAPH_CONTROLLER_CONTRACT_NAME);
    const subgraphControllerContract = await subgraphControllerContractFactory.attach(EMBLEM_SUBGRAPH_CONTROLLER_ADDRESS);
    console.log("Attached to SubgraphControllerContract at " + subgraphControllerContract.address);

    await subgraphControllerContract.postMerkleRoot(merkleRoot, 0, 256);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });


async function getLeavesFromSubgraph(_startingIndex, _treeSize, client) {
    const variables = {
        startingIndex: _startingIndex,
        treeSize: _treeSize
    };

    const earnedBadgeCounts = (await client.request(EMBLEM_EARNED_BADGE_COUNT_QUERY, variables)).earnedBadgeCounts;
    return earnedBadgeCounts;
}

async function merkleRootForEarnedBadgeCountRange(_startingIndex, _treeSize, client) {
    const leaves = await getLeavesFromSubgraph(_startingIndex, _treeSize, client);
    const hashedLeaves = leaves.map(earnedBadgeCount => hashBadge(earnedBadgeCount.earnedBadge));
    const tree = new MerkleTree(hashedLeaves, keccak256, { sortPairs: false });
    return tree.getHexRoot();
}


function hashBadge(earnedBadge) {
    let hashedBadge = ethers.utils.solidityKeccak256(
      ['address', 'int8'],
      [earnedBadge.badgeWinner.id, earnedBadge.definition.badgeDefinitionNumber]
    );
    return hashedBadge;
}
const { ethers } = require("hardhat");
const { MerkleTree } = require('merkletreejs')
const keccak256 = require('keccak256')
const { gql, request, GraphQLClient } = require("graphql-request");


const MERKLE_TREE_SIZE = 256;
const MERKLE_TREE_STARTING_INDEX = 0;
const BADGE_TO_PROVE = 18;

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
    const [badgeStruct, proof, positions, root] = await proofForEarnedBadgeCount(
        BADGE_TO_PROVE, 
        MERKLE_TREE_STARTING_INDEX, 
        MERKLE_TREE_SIZE, 
        client
    );
    console.log("Winner: " + badgeStruct.winner + "\nBadgeDefinitionNumber: " + badgeStruct.badgeDefinitionNumber +
    "\nProof: " + proof.toString() + "\nPositions: " + positions.toString() + "\nRoot: " + root);
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

async function proofForEarnedBadgeCount(earnedBadgeCountIndex, _startingIndex, _treeSize, client) {
    const leaves = await getLeavesFromSubgraph(_startingIndex, _treeSize, client);
    const hashedLeaves = leaves.map(earnedBadgeCount => hashBadge(earnedBadgeCount.earnedBadge));
    const tree = new MerkleTree(hashedLeaves, keccak256, { sortPairs: false });
    const proof = tree.getHexProof(hashedLeaves[earnedBadgeCountIndex]);
    const positions = tree.getProof(hashedLeaves[earnedBadgeCountIndex]).map(x => x.position === 'right' ? 1 : 0);
    const solidityBadge = {
        winner: leaves[earnedBadgeCountIndex].earnedBadge.badgeWinner.id,
        badgeDefinitionNumber: leaves[earnedBadgeCountIndex].earnedBadge.definition.badgeDefinitionNumber
    };
    return [solidityBadge, proof, positions, tree.getHexRoot()];
}

function hashBadge(earnedBadge) {
    let hashedBadge = ethers.utils.solidityKeccak256(
      ['address', 'int8'],
      [earnedBadge.badgeWinner.id, earnedBadge.definition.badgeDefinitionNumber]
    );
    return hashedBadge;
}
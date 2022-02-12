const { MerkleTree } = require('merkletreejs')
const keccak256 = require('keccak256')
const { ethers } = require("hardhat");
const { gql, request, GraphQLClient } = require("graphql-request");

const BADGETH_LIBRARY_CONTRACT_NAME = "BadgethLibrary";
const BADGETH_LIBRARY_TEST_CONTRACT_NAME = "BadgethLibraryTest"

const BADGETH_GQL_ENDPOINT = "https://api.studio.thegraph.com/query/2486/test/2.1.6";
const BADGETH_EARNED_BADGE_COUNT_QUERY = gql`
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

async function proveAllLeavesFromTree(_startingIndex, _treeSize, client) {
    const leaves = await getLeavesFromSubgraph(_startingIndex, _treeSize, client);
    const hashedLeaves = leaves.map(earnedBadgeCount => hashBadge(earnedBadgeCount.earnedBadge));
    const tree = new MerkleTree(hashedLeaves, keccak256, { sortPairs: false });
    const badgethLibraryTestContract = await deployBadgethLibraryTestContract();

    let success = true;
    for (let i = 0; i < leaves.length; i++) {
        const earnedBadge = {
            winner: leaves[i].earnedBadge.badgeWinner.id,
            badgeDefinitionNumber: leaves[i].earnedBadge.definition.badgeDefinitionNumber
        };
        const proof = tree.getHexProof(hashedLeaves[i]);
        const positions = tree.getProof(hashedLeaves[i]).map(x => x.position === 'right' ? 1 : 0);

        success = await badgethLibraryTestContract.verifyBadge(
            earnedBadge, 
            proof, 
            positions, 
            tree.getHexRoot()
        );
        if (!success) break;
    }
}

async function getLeavesFromSubgraph(_startingIndex, _treeSize, client) {
    const variables = {
        startingIndex: _startingIndex,
        treeSize: _treeSize
    };

    const earnedBadgeCounts = (await client.request(BADGETH_EARNED_BADGE_COUNT_QUERY, variables)).earnedBadgeCounts;
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

async function main() {
    const client = new GraphQLClient(BADGETH_GQL_ENDPOINT);
    // await proveAllLeavesFromTree(0,256,client);
    const proof = await proofForEarnedBadgeCount(0, 0, 256, client);
    const root = await merkleRootForEarnedBadgeCountRange(0, 256, client);
    console.log(proof.toString());
    console.log(root.toString());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });


async function deployBadgethLibraryContract() {
    const badgethLibraryContractFactory = await ethers.getContractFactory(BADGETH_LIBRARY_CONTRACT_NAME);
    const badgethLibraryContract = await badgethLibraryContractFactory.deploy();
    await badgethLibraryContract.deployed();
    return badgethLibraryContract;
}
  
async function deployBadgethLibraryTestContract() {
    // deploy library first
    const badgethLibraryContract = await deployBadgethLibraryContract();
    const badgethLibraryTestContractFactory = await ethers.getContractFactory(
      BADGETH_LIBRARY_TEST_CONTRACT_NAME,
      {
        libraries: {
          BadgethLibrary: badgethLibraryContract.address
        }
      }
    );
    const badgethLibraryTestContract = await badgethLibraryTestContractFactory.deploy();
    await badgethLibraryTestContract.deployed();
    return badgethLibraryTestContract;
}
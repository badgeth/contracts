const { expect } = require("chai");
const { keccak256, formatBytes32String, solidityKeccak256 } = require("ethers/lib/utils");
const { ethers } = require("hardhat");
const { fetchBadgesAndGenerateTree } = require("merkle-badges");
const { gql } = require("graphql-request");

const BADGE_DEPLOYMENT_SUBGRAPH_ID = "0x021c1a1ce318e7b4545f6280b248062592b71706";
const BADGE_DEPLOYMENT_NAME = "The Best Badger";
const BADGE_DEPLOYMENT_SYMBOL = "TBB";
const BADGE_ORACLE_MERKLE_ROOT = "0x9d20058fab9076448c912b12aa20670af090f5c6bf6ce112274ebafb854a8605";


const BADGE_CONTRACT_NAME = "Badge";
const BADGE_FACTORY_CONTRACT_NAME = "BadgeFactory";
const BADGETH_LIBRARY_CONTRACT_NAME = "BadgethLibrary";
const BADGETH_LIBRARY_TEST_CONTRACT_NAME = "BadgethLibraryTest"

const BADGETH_MINTER_ROLE = solidityKeccak256(["string"], ["MINTER_ROLE"]);
const BADGETH_BURNER_ROLE = solidityKeccak256(["string"], ["BURNER_ROLE"]);
const BADGETH_ORACLE_ROLE = solidityKeccak256(["string"], ["ORACLE_ROLE"]);


const BADGETH_GQL_ENDPOINT = "https://api.studio.thegraph.com/query/2486/test/0.5.1";
const BADGETH_GQL_QUERY = gql`
  {
    badgeAwards(first: 64, orderBy: globalBadgeNumber, where: {definition: "Captain Subgraph"}) {
      globalBadgeNumber
      winner {
        id
      }
      definition {
        id
      }
    }
  }
`

// this should be one of the known badges returned by BADGETH_GQL_QUERY
const BADGE_STRUCT = {
  winner: "0x819fd65026848d710fe40d8c0439f1220e069398",
  globalBadgeNumber: 9,
  badgeDefinitionId: "Captain Subgraph"
};

const BADGE_STRUCT_HASH = "0xcaec7708c260bcd2bdb03fde146c6d47d910ab8ad62e1c4ddfdc5f622ba9e636";

describe("Badge Deployment", function () {
  it("Should save subgraphId-badgeName upon construction", async function () {
    let badge = await deployBadgeContract();
    let expectedBadgeDefinitionId = BADGE_DEPLOYMENT_SUBGRAPH_ID + BADGE_DEPLOYMENT_NAME;
    let actualBadgeDefinitionId = await badge.badgeDefinitionId();
    expect(actualBadgeDefinitionId).to.equal(expectedBadgeDefinitionId);
  });

  it("Should increment winner's balance when the contract deployer awards winner a badge", async function () {
    let badge = await deployBadgeContract();
    let numberToTest = 10;
    let badgeStruct = BADGE_STRUCT;
    for (i=0;i<numberToTest;i++) {
      badgeStruct.globalBadgeNumber = i;
      await badge.awardBadge(badgeStruct);
    }

    let afterBadgeCount = (await badge.balanceOf(BADGE_STRUCT.winner)).toString();
    expect(afterBadgeCount).to.equal(numberToTest.toString());
  });

  it("Should allow contract deployer to award and burn badges in batches", async function () {
    const account = await mainAccount();
    const badge = await deployBadgeContract();
    await badge.grantRole(BADGETH_BURNER_ROLE, account.address)

    const badgeIds = [3, 1, 5, 22, 44, 35];
    let badgeStructs = badgeStructsFromIds(badgeIds);
    await badge.awardBadges(badgeStructs);

    // get balance before and after burn
    const balanceBeforeBurn = await badge.balanceOf(BADGE_STRUCT.winner);
    await badge.burnBadges(badgeIds);
    const balanceAfterBurn = await badge.balanceOf(BADGE_STRUCT.winner);

    const badgeBurnSuccess = (balanceBeforeBurn == badgeIds.length) && (balanceAfterBurn == 0);
    
    expect(badgeBurnSuccess).to.equal(true); 
  });
});

describe("BadgeFactory Deployment", function () {
  it("Should save badges registered by owner of BadgeFactory", async function () {
    let badgeFactory = await deployBadgeFactory();

    await badgeFactory.deployBadgeContract(
      BADGE_DEPLOYMENT_SUBGRAPH_ID,
      BADGE_DEPLOYMENT_NAME,
      BADGE_DEPLOYMENT_SYMBOL
    );

    let badgeReference = await badgeFactory.getBadge(BADGE_DEPLOYMENT_SUBGRAPH_ID, BADGE_DEPLOYMENT_NAME);
    expect(badgeReference).to.not.equal(ethers.constants.AddressZero);
  });

  it("Should facilitate minting of badges", async function () {
    const badgeFactoryContract = await deployBadgeFactory();

    await badgeFactoryContract.deployBadgeContract(
      BADGE_DEPLOYMENT_SUBGRAPH_ID,
      BADGE_DEPLOYMENT_NAME,
      BADGE_DEPLOYMENT_SYMBOL
    );

    const account = await mainAccount();
    await badgeFactoryContract.transferBadgeAdminRole(
      BADGE_DEPLOYMENT_SUBGRAPH_ID,
      BADGE_DEPLOYMENT_NAME,
      account.address
    )


    // attach to the Badge contract our BadgeFactory just deployed
    const badgeReference = await badgeFactoryContract.getBadge(BADGE_DEPLOYMENT_SUBGRAPH_ID, BADGE_DEPLOYMENT_NAME);

    const badgethLibraryContract = await deployBadgethLibraryContract();
    const badgeContractFactory = await ethers.getContractFactory(
      BADGE_CONTRACT_NAME,
      {
        libraries: {
          BadgethLibrary: badgethLibraryContract.address
        }
      }
    );
    const badgeContract = await badgeContractFactory.attach(badgeReference);
    await badgeContract.grantRole(BADGETH_MINTER_ROLE, badgeFactoryContract.address)

    const balanceBeforeAward = await badgeContract.balanceOf(BADGE_STRUCT.winner);

    await badgeFactoryContract.awardBadge(
      BADGE_DEPLOYMENT_SUBGRAPH_ID, 
      BADGE_DEPLOYMENT_NAME, 
      BADGE_STRUCT
    );

    const balanceAfterAward = await badgeContract.balanceOf(BADGE_STRUCT.winner);
    const ownerAfterAward = await badgeContract.ownerOf(BADGE_STRUCT.globalBadgeNumber);

    expect(balanceBeforeAward.toString()).to.equal((balanceAfterAward - 1).toString());
    expect(ownerAfterAward.toString().toLowerCase()).to.equal(BADGE_STRUCT.winner);
  });

  it("Should allow users with ORACLE_ROLE privileges to update the merkle root", async function () {
    const badgeContract = await deployBadgeContract();
    const account = await mainAccount();
    await badgeContract.grantRole(BADGETH_ORACLE_ROLE, account.address);
    await badgeContract.updateMerkleRoot(BADGE_ORACLE_MERKLE_ROOT);
    const merkleRoot = await badgeContract.getMerkleRoot();

    expect(merkleRoot).to.equal(BADGE_ORACLE_MERKLE_ROOT);
  });
});

describe("BadgethLibrary", function () {
  it("Should hash badges with results equivalent to ethers.utils", async function () {
    const badgethLibraryTestContract = await deployBadgethLibraryTestContract();
    const hashedBadge = await badgethLibraryTestContract.hashBadge(BADGE_STRUCT);
    const javascriptTestHash = hashBadge(BADGE_STRUCT);
    expect(hashedBadge).to.equal(javascriptTestHash);
  });
});

function hashBadge(badgeStruct) {
  return ethers.utils.solidityKeccak256(
    ['address', 'uint16', 'string'],
    [badgeStruct.winner, badgeStruct.globalBadgeNumber, badgeStruct.badgeDefinitionId],
  );
}

describe("Badge Merkle Drop", function () {
  it("Should verify merkle proofs generated by merkle-badges npm package", async function () {
    const mTree = await fetchBadgesAndGenerateTree(BADGETH_GQL_QUERY, BADGETH_GQL_ENDPOINT);
    const mHexRoot = mTree.getHexRoot();
    const leaf3HexProof = mTree.getHexProof("0x1385a6acbf469383fd18792f3cf424bc75a5a42b6a3f43ff7fb10058b136d0ff");
    const badgeContract = await deployBadgeContract();
    const account = await mainAccount();
    await badgeContract.grantRole(BADGETH_ORACLE_ROLE, account.address);
    await badgeContract.updateMerkleRoot(mHexRoot);
    await badgeContract.awardBadgeWithProof(BADGE_STRUCT, leaf3HexProof, mHexRoot);
    const balanceAfterAward = await badgeContract.balanceOf(BADGE_STRUCT.winner);
    expect("1").to.equal((balanceAfterAward.toString()));
  });
});


////////////////// HELPERS //////////////////

async function deployBadgeContract() {
  const badgethLibraryContract = await deployBadgethLibraryContract();
  const badgeContractFactory = await ethers.getContractFactory(
    BADGE_CONTRACT_NAME,
    {
      libraries: {
        BadgethLibrary: badgethLibraryContract.address
      }
    }
  );
  const badge = await badgeContractFactory.deploy(
    BADGE_DEPLOYMENT_SUBGRAPH_ID,
    BADGE_DEPLOYMENT_NAME,
    BADGE_DEPLOYMENT_SYMBOL
  );
  await badge.deployed();
  const account = await mainAccount();
  await badge.grantRole(BADGETH_MINTER_ROLE, account.address);
  return badge;
}

async function deployBadgeFactory() {
  const badgethLibraryContract = await deployBadgethLibraryContract();
  const BadgeFactory = await ethers.getContractFactory(
    BADGE_FACTORY_CONTRACT_NAME,
    {
      libraries: {
        BadgethLibrary: badgethLibraryContract.address
      }
    }
  );
  const badgeFactory = await BadgeFactory.deploy();
  await badgeFactory.deployed();
  return badgeFactory;
}

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

async function mainAccount() {
  const accounts = await hre.ethers.getSigners();
  return accounts[0];
}

function badgeStructWithUniqueId(badgeId) {
  return {
    winner: BADGE_STRUCT.winner,
    globalBadgeNumber: badgeId,
    badgeDefinitionId: BADGE_STRUCT.badgeDefinitionId
  };
}

function badgeStructsFromIds(badgeIds) {
  let badgeStructs = [];
  badgeIds.forEach(id => {
    badgeStructs.push(badgeStructWithUniqueId(id))
  });
  return badgeStructs;
}
const { expect } = require("chai");
const { keccak256, formatBytes32String, solidityKeccak256 } = require("ethers/lib/utils");
const { ethers } = require("hardhat");

const BADGE_DEPLOYMENT_SUBGRAPH_ID = "0x021c1a1ce318e7b4545f6280b248062592b71706";
const BADGE_DEPLOYMENT_NAME = "The Best Badger";
const BADGE_DEPLOYMENT_SYMBOL = "TBB";

const BADGE_CONTRACT_NAME = "Badge";
const BADGE_FACTORY_CONTRACT_NAME = "BadgeFactory";

const BADGETH_MINTER_ROLE = solidityKeccak256(["string"], ["MINTER_ROLE"]);
const BADGETH_BURNER_ROLE = solidityKeccak256(["string"], ["BURNER_ROLE"]);


const BADGE_STRUCT = {
  winner: "0x0AE0C235C1E04eF85b3954186a3be6786cEef9b4",
  badgeId: 3,
  tokenURI: "ipfs://QmX2FBuDQKSsspXEq7uJbeyDnCKq9Bc16AQ8zX3YQXGbMt"
}

describe("Badge Deployment", function () {
  it("Should save subgraphId-badgeName upon construction", async function () {
    let badge = await deployBadgeContract();
    let expectedBadgeDefinitionId = BADGE_DEPLOYMENT_SUBGRAPH_ID + BADGE_DEPLOYMENT_NAME;
    let actualBadgeDefinitionId = await badge.badgeDefinitionId();
    expect(actualBadgeDefinitionId).to.equal(expectedBadgeDefinitionId);
  });

  it("Should save tokenURI of badge when it is minted", async function () {
    const badge = await deployBadgeContract();
    const expectedTokenURI = BADGE_STRUCT.tokenURI;

    await badge.awardBadge(BADGE_STRUCT);
    const actualTokenURI = await badge.tokenURI(BADGE_STRUCT.badgeId);
    expect(actualTokenURI).to.equal(expectedTokenURI);
  });

  it("Should increment winner's balance when the contract deployer awards winner a badge", async function () {
    let badge = await deployBadgeContract();
    let numberToTest = 10;
    let badgeStruct = BADGE_STRUCT;
    for (i=0;i<numberToTest;i++) {
      badgeStruct.badgeId = i;
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

    console.log(badgeStructs);

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
    const badgeContractFactory = await ethers.getContractFactory(BADGE_CONTRACT_NAME);
    const badgeContract = await badgeContractFactory.attach(badgeReference);
    await badgeContract.grantRole(BADGETH_MINTER_ROLE, badgeFactoryContract.address)

    const balanceBeforeAward = await badgeContract.balanceOf(BADGE_STRUCT.winner);

    await badgeFactoryContract.awardBadge(
      BADGE_DEPLOYMENT_SUBGRAPH_ID, 
      BADGE_DEPLOYMENT_NAME, 
      BADGE_STRUCT
    );

    const balanceAfterAward = await badgeContract.balanceOf(BADGE_STRUCT.winner);
    const ownerAfterAward = await badgeContract.ownerOf(BADGE_STRUCT.badgeId);

    expect(balanceBeforeAward.toString()).to.equal((balanceAfterAward - 1).toString());
    expect(ownerAfterAward).to.equal(BADGE_STRUCT.winner);
  });
});


////////////////// HELPERS //////////////////

async function deployBadgeContract() {
  const Badge = await ethers.getContractFactory(BADGE_CONTRACT_NAME);
  const badge = await Badge.deploy(
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
  const BadgeFactory = await ethers.getContractFactory(BADGE_FACTORY_CONTRACT_NAME);
  const badgeFactory = await BadgeFactory.deploy();
  await badgeFactory.deployed();
  return badgeFactory;
}

async function mainAccount() {
  const accounts = await hre.ethers.getSigners();
  return accounts[0];
}

function badgeStructWithUniqueId(badgeId) {
  return {
    winner: BADGE_STRUCT.winner,
    badgeId: badgeId,
    tokenURI: BADGE_STRUCT.tokenURI
  };
}

function badgeStructsFromIds(badgeIds) {
  let badgeStructs = [];
  badgeIds.forEach(id => {
    badgeStructs.push(badgeStructWithUniqueId(id))
  });
  return badgeStructs;
}
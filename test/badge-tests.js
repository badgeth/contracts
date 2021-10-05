const { expect } = require("chai");
const { ethers } = require("hardhat");

const BADGE_DEPLOYMENT_SUBGRAPH_ID = "0x021c1a1ce318e7b4545f6280b248062592b71706";
const BADGE_DEPLOYMENT_NAME = "The Best Badger";
const BADGE_DEPLOYMENT_SYMBOL = "TBB";

const BADGE_CONTRACT_NAME = "Badge";
const BADGE_FACTORY_CONTRACT_NAME = "BadgeFactory";

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

    await awardBadge(badge, BADGE_STRUCT);
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

  it("Should facilitate minting 1000 badges between 10 winners", async function () {
    let badge = await deployBadgeContract();
    const accounts = await hre.ethers.getSigners();
    for (i=0;i<1000;i++) {
      let badgeData = BADGE_STRUCT;
      badgeData.winner = accounts[i%10].address.toString();
      badgeData.badgeId = i;
      await badge.awardBadge(badgeData);
      // console.log("minting badge #" + i + " to " + accounts[i%15].address);
    }
    let badgeBalance = (await badge.balanceOf(accounts[0].address)).toString();
    expect(badgeBalance).to.equal("100");
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
    const badgeFactory = await deployBadgeFactory();

    await badgeFactory.deployBadgeContract(
      BADGE_DEPLOYMENT_SUBGRAPH_ID,
      BADGE_DEPLOYMENT_NAME,
      BADGE_DEPLOYMENT_SYMBOL
    );

    // attach to the Badge contract our BadgeFactory just deployed
    const badgeReference = await badgeFactory.getBadge(BADGE_DEPLOYMENT_SUBGRAPH_ID, BADGE_DEPLOYMENT_NAME);
    const badgeContractFactory = await ethers.getContractFactory(BADGE_CONTRACT_NAME);
    const badge = await badgeContractFactory.attach(badgeReference);

    const balanceBeforeAward = await badge.balanceOf(BADGE_STRUCT.winner);

    await badgeFactory.awardBadge(
      BADGE_DEPLOYMENT_SUBGRAPH_ID, 
      BADGE_DEPLOYMENT_NAME, 
      BADGE_STRUCT
    );

    const balanceAfterAward = await badge.balanceOf(BADGE_STRUCT.winner);
    const ownerAfterAward = await badge.ownerOf(BADGE_STRUCT.badgeId);

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
  return badge;
}

async function deployBadgeFactory() {
  const BadgeFactory = await ethers.getContractFactory(BADGE_FACTORY_CONTRACT_NAME);
  const badgeFactory = await BadgeFactory.deploy();
  await badgeFactory.deployed();
  return badgeFactory;
}

async function awardBadge(badgeContract, badgeStruct) {
  badgeContract.awardBadge(badgeStruct);
}

async function awardBadges(badgeContract, badgeStructs) {
  badgeStructs.forEach(badgeStruct => awardBadge(badgeContract, badgeStruct));
}

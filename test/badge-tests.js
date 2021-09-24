const { expect } = require("chai");
const { Contract } = require("ethers");
const { ethers } = require("hardhat");

const BADGE_DEPLOYMENT_SUBGRAPH_ID = "0x021c1a1ce318e7b4545f6280b248062592b71706";
const BADGE_WINNER_ACCOUNT = "0x0AE0C235C1E04eF85b3954186a3be6786cEef9b4";
const BADGE_DEPLOYMENT_NAME = "The Best Badger";
const BADGE_DEPLOYMENT_SYMBOL = "TBB";

const BADGE_CONTRACT_NAME = "Badge";
const BADGE_FACTORY_CONTRACT_NAME = "BadgeFactory";

describe("Badge Deployment", function () {
  it("Should save subgraphId-badgeName upon construction", async function () {
    let badge = await deployBadgeContract();
    let expectedBadgeDefinitionId = BADGE_DEPLOYMENT_SUBGRAPH_ID + BADGE_DEPLOYMENT_NAME;
    let actualBadgeDefinitionId = await badge.badgeDefinitionId();
    expect(actualBadgeDefinitionId).to.equal(expectedBadgeDefinitionId);
  });

  it("Should generate tokenURIs in the format of {subgraphId}{badgeName}{tokenId}", async function () {
    let badge = await deployBadgeContract();
    let numberToTest = 10;
    let expectedBaseURI = BADGE_DEPLOYMENT_SUBGRAPH_ID + BADGE_DEPLOYMENT_NAME;

    await awardBadges(badge, numberToTest);
    for(i=0;i<numberToTest;i++) {
      let expectedTokenURI = expectedBaseURI + i;
      let actualTokenURI = await badge.tokenURI(i);
      expect(actualTokenURI).to.equal(expectedTokenURI);
    }
  });

  it("Should increment winner's balance when the contract deployer awards winner a badge", async function () {
    let badge = await deployBadgeContract();
    await badge.awardBadge(1, BADGE_WINNER_ACCOUNT);
    await badge.awardBadge(2, BADGE_WINNER_ACCOUNT);
    let afterBadgeCount = (await badge.balanceOf(BADGE_WINNER_ACCOUNT)).toString();
    expect(afterBadgeCount).to.equal("2");
  });

  // it("Should facilitate minting 1000 badges between 15 winners", async function () {
  //   let badge = await deployBadgeContract();
  //   const accounts = await hre.ethers.getSigners();
  //   for (i=0;i<1000;i++) {
  //     await badge.awardBadge(i, accounts[i%10].address);
  //     // console.log("minting badge #" + i + " to " + accounts[i%15].address);
  //   }
  //   let badgeBalance = (await badge.balanceOf(accounts[0].address)).toString();
  //   expect(badgeBalance).to.equal("100");
  // });
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
    const tokenIdToMint = 3;

    await badgeFactory.deployBadgeContract(
      BADGE_DEPLOYMENT_SUBGRAPH_ID,
      BADGE_DEPLOYMENT_NAME,
      BADGE_DEPLOYMENT_SYMBOL
    );

    // attach to the Badge contract our BadgeFactory just deployed
    const badgeReference = await badgeFactory.getBadge(BADGE_DEPLOYMENT_SUBGRAPH_ID, BADGE_DEPLOYMENT_NAME);
    const badgeContractFactory = await ethers.getContractFactory(BADGE_CONTRACT_NAME);
    const badge = await badgeContractFactory.attach(badgeReference);

    const balanceBeforeAward = await badge.balanceOf(BADGE_WINNER_ACCOUNT);

    await badgeFactory.awardBadge(
      BADGE_DEPLOYMENT_SUBGRAPH_ID,
      BADGE_DEPLOYMENT_NAME,
      tokenIdToMint,
      BADGE_WINNER_ACCOUNT
    );

    const balanceAfterAward = await badge.balanceOf(BADGE_WINNER_ACCOUNT);
    const ownerAfterAward = await badge.ownerOf(tokenIdToMint);

    expect(balanceBeforeAward.toString()).to.equal((balanceAfterAward - 1).toString());
    expect(ownerAfterAward).to.equal(BADGE_WINNER_ACCOUNT);
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

async function awardBadges(badgeContract, numberToAward) {
  for (i=0;i<numberToAward;i++) {
    badgeContract.awardBadge(i, BADGE_WINNER_ACCOUNT);
  }
}

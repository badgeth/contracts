const { expect } = require("chai");
const { ethers } = require("hardhat");

const BADGE_DEPLOYMENT_SUBGRAPH_ID = "0x021c1a1ce318e7b4545f6280b248062592b71706";
const BADGE_WINNER_ACCOUNT = "0x0AE0C235C1E04eF85b3954186a3be6786cEef9b4";
const BADGE_DEPLOYMENT_NAME = "The Best Badger";
const BADGE_DEPLOYMENT_SYMBOL = "TBB";

const BADGE_CONTRACT_NAME = "Badge";
const BADGE_FACTORY_CONTRACT_NAME = "BadgeFactory";

describe("Badge Deployment", function () {
  it("Should save subgraph id, badge name, and symbol", async function () {
    let badge = await deployBadgeContract();

    expect(await badge.subgraphId()).to.equal(BADGE_DEPLOYMENT_SUBGRAPH_ID);
    expect(await badge.name()).to.equal(BADGE_DEPLOYMENT_NAME);
    expect(await badge.symbol()).to.equal(BADGE_DEPLOYMENT_SYMBOL);
  });

  it("Should increment winner's balance when the contract deployer awards winner a badge", async function () {
    let badge = await deployBadgeContract();
    await badge.awardBadge(1, BADGE_WINNER_ACCOUNT);
    await badge.awardBadge(2, BADGE_WINNER_ACCOUNT);
    let afterBadgeCount = (await badge.balanceOf(BADGE_WINNER_ACCOUNT)).toString();
    expect(afterBadgeCount).to.equal("2");
  });

  it("Should facilitate minting of 1000 badges", async function () {
    let badge = await deployBadgeContract();
    const accounts = await hre.ethers.getSigners();
    
    for (i=0;i<1000;i++) {
      await badge.awardBadge(i, accounts[i%10].address);
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

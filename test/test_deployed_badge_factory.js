const TestDeployedBadgeFactory = artifacts.require("BadgeFactory");

/*
 * uncomment accounts to access the test accounts made available by the
 * Ethereum client
 * See docs: https://www.trufflesuite.com/docs/truffle/testing/writing-tests-in-javascript
 */
contract("TestDeployedBadgeFactory", function (accounts) {
  it("should find a deployed BadgeFactory contract", async function () {
    await TestDeployedBadgeFactory.deployed();
    assert.isTrue(true);
  });

  it("should have governance assigned to first web3 account", async function () {
    let badgeFactoryContract = await TestDeployedBadgeFactory.deployed();
    let factoryGov = await badgeFactoryContract.governance.call();

    assert.equal(factoryGov, accounts[0]);
  });

  it("should allow governance to change the queryURL", async function () {
    let expectedQueryURL = "get kitties";
    let badgeFactoryContract = await TestDeployedBadgeFactory.deployed();
    await badgeFactoryContract.setQueryURL(expectedQueryURL, {from: accounts[0]} );
    let actualQueryURL = await badgeFactoryContract.queryURL.call();

    assert.equal(expectedQueryURL, actualQueryURL);
  });

  it("should emit an event when governance creates a new badge definition", async function () {
    let badgeFactoryContract = await TestDeployedBadgeFactory.deployed();
    await badgeFactoryContract.createBadgeDefinition("Is Over Delegated", "Indexer", "isOverDelegated", false, true, {from: accounts[0]} );
    assert.isTrue(true);
  });

})

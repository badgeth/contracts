const assert = require('assert');

const BadgeFactory = artifacts.require("BadgeFactory");

const GQL_QUERY_ITS_ONLY_WAFER_THIN = "{itsOnlyWaferThinBadges(first: 200){\nid\nawardedAtBlock\nawarded"

contract("BadgeFactory", async accounts => {
    it("should assign governance to 1st ethereum account", async () => {
        const factory = await BadgeFactory.deployed();
        const factoryGov = await factory.governance.call();
        assert.strictEqual(accounts[0], factoryGov, "gov not set");
    });

    it("should allow governance to set which subgraph gets queried", async () => {
        const factory = await BadgeFactory.deployed();
        factory.setQueryURL("testing").call();
        assert.strictEqual(factory.queryURL.call(), "testing", "Failed to set queryURL");
    })

    // it("should emit a {BadgeDefinitionCreated} event when createBadgeDefinitionIsCalled", async () => {
    //     const factory = await BadgeFactory.deployed();
    //     factory.createBadgeDefinition("indexer.isOverDelegated", false, true);
    // })
});
var assert = require('assert');

const BadgeFactory = artifacts.require("BadgeFactory");

contract("BadgeFactory", async accounts => {
    it("should assign governance to 1st ethereum account", async () => {
        const factory = await BadgeFactory.deployed();
        const factoryGov = await factory.governance.call();
        assert.strictEqual(accounts[0], factoryGov, "gov not set");
    });
});
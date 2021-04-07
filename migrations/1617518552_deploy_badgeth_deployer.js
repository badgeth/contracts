const BadgeFactory = artifacts.require("BadgeFactory");
const BadgeRecipientOracle = artifacts.require("BadgeRecipientOracle");


module.exports = function(deployer, network, accounts) {
  let owner = accounts[0];
  deployer.deploy(BadgeFactory, "first 100 owners query");
  deployer.deploy(BadgeRecipientOracle);
};

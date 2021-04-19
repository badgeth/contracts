const BadgeRegistry = artifacts.require("BadgeRegistry");

module.exports = function(deployer, network, accounts) {
  let owner = accounts[0];
  deployer.deploy(BadgeRegistry, owner, 0);
};

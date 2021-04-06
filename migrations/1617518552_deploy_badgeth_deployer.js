const BadgeFactory = artifacts.require("BadgeFactory");
const BadgeRecipientOracle = artifacts.require("BadgeRecipientOracle");

// paste ganache account here for testing
const BADGETH_GOV_ADDRESS = "0xf4A1459be82723C4A2aFbA92d513eC80eFA9D4EB"

module.exports = function(_deployer) {
  _deployer.deploy(BadgeFactory, BADGETH_GOV_ADDRESS).then(function() {
    _deployer.deploy(BadgeRecipientOracle, BADGETH_GOV_ADDRESS);
  });
};

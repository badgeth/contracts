const BadgethDeployer = artifacts.require("BadgethDeployer");
const BadgeFactory = artifacts.require("BadgeFactory");

module.exports = function(_deployer) {
  _deployer.deploy(BadgethDeployer);
};

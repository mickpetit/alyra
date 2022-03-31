const instance = artifacts.require("Voting");

module.exports = function (deployer) {
  deployer.deploy(instance);
};

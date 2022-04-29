const instance = artifacts.require("Chainlink");

module.exports = function (deployer) {
  deployer.deploy(instance);
};

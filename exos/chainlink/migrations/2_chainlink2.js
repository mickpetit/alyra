const instance = artifacts.require("Chainlink2");

module.exports = function (deployer) {
  deployer.deploy(instance, 3545);
};

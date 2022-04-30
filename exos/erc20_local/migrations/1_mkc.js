const ERC20 = artifacts.require("MKC");
const MiKaDefi = artifacts.require('MikaDefi');

module.exports = async function (deployer, _network, accounts) {
  await deployer.deploy(ERC20);
  const myERC20 = await ERC20.deployed();
  await deployer.deploy(MiKaDefi, myERC20.address);
  const myDefi = await MiKaDefi.deployed();

  await myERC20.faucet(myDefi.address, 1000);
  await myDefi.transfer(accounts[1], 1000);

  const balance0 = await myERC20.balanceOf(myDefi.address);
  const balance1 = await myERC20.balanceOf(accounts[1]);

  console.log(balance0.toString());
  console.log(balance1.toString());
};

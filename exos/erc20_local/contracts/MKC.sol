// SPDX-License-Identifier: MIT
pragma solidity 0.8.13;

import '@openzeppelin/contracts/token/ERC20/ERC20.sol';

contract MKC is ERC20 {
  constructor() ERC20 ('MiKa Stablecoin', 'MKC') {}

  function faucet(address recipient, uint amount) external {
    _mint(recipient, amount);
  }
}

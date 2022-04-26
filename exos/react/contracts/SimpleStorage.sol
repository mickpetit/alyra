// SPDX-License-Identifier: MIT
pragma solidity 0.8.13;

contract SimpleStorage {
  uint storedData;
  event ValueUpdated(uint value);

  function set(uint x) public {
    storedData = x;
    emit ValueUpdated(x);
  }

  function get() public view returns (uint) {
    return storedData;
  }
}

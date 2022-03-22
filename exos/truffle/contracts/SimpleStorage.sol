// SPDX-License-Identifier: GPL-3.0

//Tell the Solidity compiler what version to use
pragma solidity 0.8.13;

contract SimpleStorage {
    uint storedData;

    function set(uint x) public {
        storedData = x;
    }

    function get() public view returns (uint) {
        return storedData;
    }
}

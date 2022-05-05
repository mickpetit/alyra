// SPDX-License-Identifier: GPL-3.0

pragma solidity 0.8.13;

contract StorageV2 {

    uint256 number;

    function store2(uint256 num) public {
        number = num;
    }

    function retrieve() public view returns (uint256){
        return number;
    }

    function increment() public {
        number++;
    }
}

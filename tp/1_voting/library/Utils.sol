// SPDX-License-Identifier: GPL-3.0

pragma solidity 0.8.13;

library Utils {
    function compareTwoStrings(string memory str1, string memory str2) external pure returns (bool) {
        return keccak256(abi.encodePacked(str1)) == keccak256(abi.encodePacked(str2));
    }

    function notEmptyString(string memory str) external pure returns (bool) {
        return bytes(str).length > 0;
    }

    function stringConcatenation(string memory str1, string memory str2) external pure returns (string memory) {
        return string(abi.encodePacked(str1, str2));
    }
}

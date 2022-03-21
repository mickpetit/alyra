pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20";

contract MicaCoin is ERC20 {
    constructor(uint256 initialSupply) ERC20("MicaCoin", "MCC") {
        _mint(msg.sender, initialSupply);
    }
}

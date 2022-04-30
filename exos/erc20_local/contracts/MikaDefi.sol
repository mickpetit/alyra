pragma solidity ^0.8.0;

import '@openzeppelin/contracts/token/ERC20/IERC20.sol';

contract MikaDefi {

    IERC20 mkc;

    constructor(address mkcAddress) {
        mkc = IERC20(mkcAddress);
    }

    function transfer(address recipient, uint amount) external {
        mkc.transfer(recipient, amount);
    }
}

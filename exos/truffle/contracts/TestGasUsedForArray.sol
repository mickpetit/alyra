pragma solidity ^0.8.0;

contract TestGasUsedForArray {
    struct Proposal {
        string title;
        string description;
        uint voteCount;
        address author;
    }

    Proposal[] _list;

    constructor() {
        for (uint i = 0; i < 100; i++) {
            _list.push(Proposal("my title", "my description", 0, address(0)));
        }
    }
}

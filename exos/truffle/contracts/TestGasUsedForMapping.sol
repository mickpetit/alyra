pragma solidity ^0.8.0;

contract TestGasUsedForMapping {
    struct Proposal {
        string title;
        string description;
        uint voteCount;
        address author;
    }

    mapping (uint => Proposal) _list;
    uint _listLength;

    constructor() {
        for (uint i = 0; i < 100; i++) {
            _list[i] = Proposal("my title", "my description", 0, address(0));
            _listLength = i;
        }
    }
}

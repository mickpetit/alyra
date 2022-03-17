pragma solidity >=0.8.0 <= 0.9.0;

contract DessinerCestGagner {

    address private owner;
    string public clue;
    bool public found;
    string word;
    mapping(address => bool) players;
    address public winner;

    enum States {started, winning, closed}
    States public internalState;

    constructor() {
        owner = msg.sender;
        internalState = States.closed;
    }

    modifier onlyOwner() {
        require(owner == msg.sender, "Only owner authorized");
        _;
    }

    modifier onlyStarted() {
        require(internalState != States.closed, "Not yet started");
        require(internalState != States.winning, "Already winning");
        _;
    }

    function start(string memory _word, string memory _clue) onlyOwner payable public {
        word = _word;
        clue = _clue;
        internalState = States.started;
    }

    function test(string memory _word) onlyStarted public returns (bool) {
        players[msg.sender] = true;
        if ( keccak256(abi.encodePacked(word)) == keccak256(abi.encodePacked(_word)) ) {

            if ( internalState != States.winning ) {
                found = true;
                winner = msg.sender;
            }


            return true;
        }

        return false;
    }

    function hasPlayed() view public returns (bool) {
        return players[msg.sender];
    }

}

//*** Exercice 2 ***// 
// You choose Head or Tail and send 1 ETH.
// The next party send 1 ETH and try to guess what you chose.
// If it succeed it gets 2 ETH, else you get 2 ETH.
contract HeadOrTail {
    bool public chosen; // True if head/tail has been chosen.
    bytes32 lastChoiceHead; // True if the choice is head.
    address payable public lastParty; // The last party who chose.

    /** @dev Must be sent 1 ETH.
     *  Choose head or tail to be guessed by the other player.
     *  @param _chooseHead True if head was chosen, false if tail was chosen.
     */
    function choose(bytes32 _chooseHead) public payable {
        require(!chosen);
        require(msg.value == 1 ether);

        chosen=true;
        lastChoiceHead=_chooseHead;
        lastParty=payable(msg.sender);
    }

    bool guessPlayer2;
    address winner;
    address payable partyB;
    function guess(bool _guessHead) public payable {
        require(chosen);
        require(msg.value == 1 ether);

        partyB = payable(msg.sender);
        guessPlayer2 = _guessHead;
    }

    function resolve(bool _chooseHead, uint _randomNumber) public {
        require(keccak256(abi.encodePacked(_chooseHead, _randomNumber)) == lastChoiceHead);
        if (guessPlayer2 == _chooseHead)
            winner = partyB;
        else
            winner = lastParty;
    }

    bool winnerTookPrice;
    function WinnerGetPrice() public{
        require (!winnerTookPrice);
        payable(winner).transfer(2 ether);
        winnerTookPrice = true;
        chosen=false;
    }

    function getHash(bool _chooseHead, uint _randomNumber) public view returns(bytes32){
        return keccak256(abi.encodePacked(_chooseHead, _randomNumber));
    }
}

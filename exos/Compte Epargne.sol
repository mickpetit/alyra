pragma solidity >=0.8.0 <= 0.9.0;

contract CompteEpargne {

    mapping (address => uint) public accounts;

    address owner;
    uint public createdAt;

    constructor() {
        owner = msg.sender;
        createdAt = block.timestamp;
    }

    modifier onlyOwner() {
        require(owner == msg.sender, "Only owner authorized");
        _;
    }

    function deposite() payable public {
        require(msg.value > 0, "Empty value not allowed");
        accounts[msg.sender] += msg.value;
    }

    function withdraw(uint amount) public payable {
        require(accounts[msg.sender] >= amount, "Not enought funds");
        accounts[msg.sender] -= amount;
        (bool sent, bytes memory data) = msg.sender.call{value: amount}("");
        require (sent, "Failed to sent ether");
    }

    function balance() onlyOwner view public returns (uint) {
        return address(this).balance;
    }

    function close() onlyOwner public {
        require((createdAt + 10 <= block.timestamp), "C'est trop tot :), just wait");
        (bool sent, bytes memory data) = msg.sender.call{value: owner.balance}("");
    }

}

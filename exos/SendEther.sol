pragma solidity >=0.8.0 <= 0.9.0;

contract SendEther {
    function send (address payable _to) public payable {
        (bool sent, bytes memory data) = _to.call{value: msg.value}('');
        require (sent, "Failed to sent ether");
    }
}

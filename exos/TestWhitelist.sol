pragma solidity >0.8.0 <= 0.9.0;

contract Whitelist {
    mapping (address => bool) whitelist;

    function allow (address to) public {
        whitelist[to] = true;
    }

    function deny (address to) public {
        whitelist[to] = false;
    }

    function isAllowed (address search) view public returns (bool) {
        return whitelist[search] == true;
    }

    function isDenied (address search) view public returns (bool) {
        return whitelist[search] == false;
    }
}

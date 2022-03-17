pragma solidity >0.8.0 <= 0.9.0;

contract Whitelist {
    mapping (address => Person) whitelist;
    struct Person {
        string name;
        uint age;
        bool state;
    }

    function attach (address to, string memory name, uint age, bool state) private {
        whitelist[to] = Person({
        name: name,
        age: age,
        state: state
        });
    }

    function deny (address to, string memory name, uint age) public {
        attach(to, name, age, false);
    }

    function allow (address to, string memory name, uint age) public {
        attach(to, name, age, true);
    }

    function isAllowed (address search) view public returns (bool) {
        return whitelist[search].state == true;
    }

    function isDenied (address search) view public returns (bool) {
        return whitelist[search].state == false;
    }

    function get(address search) view public returns (Person memory) {
        return whitelist[search];
    }
}

pragma solidity >0.8.0 <= 0.9.0;

contract Whitelist {
    struct Person {
        string name;
        uint age;
    }

    Person[] public list;

    modifier onlyOnList (uint _idx) {
        require (_idx < list.length, "Index is out of bound");
        _;
    }

    function add (string memory _name, uint _age) public {
        list.push(Person({
        name: _name,
        age: _age
        }));
    }

    function remove (uint _idx) public onlyOnList(_idx) {

        for (uint i = _idx; i < list.length - 1; i++ ) {
            list[i] = list[i + 1];
        }

        list.pop();
    }
}

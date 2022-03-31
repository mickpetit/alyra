// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.8.13;

contract StudentNotation {

    struct StudentNotation {
        string name;
        uint note;
    }

    mapping (address => StudentNotation) public studentsMapping;
    StudentNotation[] public studentsArray;

    function addStudent(address addr, string memory name, uint note) external {
        studentsMapping[addr] = StudentNotation(name, note);
        studentsArray.push(StudentNotation(name, note));
    }

    function getFromMapping(address student) external returns (StudentNotation memory) {
        return studentsMapping[student];
    }

    function getFromArray(string memory name) external returns (StudentNotation memory) {
        StudentNotation memory found;
        for (uint i = 0; i < studentsArray.length; i++) {
            if ( compareTwoStrings(studentsArray[i].name, name) ) {
                found = studentsArray[i];
                break;
            }
        }

        return found;
    }

    function deleteStudent (address student) external {
        for (uint i = 0; i < studentsArray.length; i++) {
            if ( compareTwoStrings(studentsMapping[student].name, studentsArray[i].name) ) {
                delete studentsArray[i];
            }
        }

        delete (studentsMapping[student]);
    }


    function compareTwoStrings(string memory str1, string memory str2) internal pure returns (bool) {
        return keccak256(abi.encodePacked(str1)) == keccak256(abi.encodePacked(str2));
    }
}

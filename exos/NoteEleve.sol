pragma solidity >=0.8.0 <= 0.9.0;

contract NotationEleve {

    struct Grade {
        Subjects subject;
        uint grade;
        bool initialized;
    }

    struct Student {
        string name;
        mapping(Subjects => Grade) grades;
    }

    struct Teacher {
        string name;
        Subjects subject;
    }

    enum Subjects {Maths, Bio, Geo, undefined}
    mapping(string => Subjects) public subjectsMapping;
    mapping(address => Teacher) public teachers;
    mapping(address => Student) public students;

    address owner;

    constructor() {
        owner = msg.sender;
        subjectsMapping['maths'] = Subjects.Maths;
        subjectsMapping['bio'] = Subjects.Bio;
        subjectsMapping['geo'] = Subjects.Geo;
    }

    modifier onlyOwner() {
        require(owner == msg.sender, "Only owner authorized");
        _;
    }

    modifier withValidSubject(string memory _subject) {
        require( subjectFromString(_subject) != Subjects.undefined, "Subjects allowed: maths / bio / geo");
        _;
    }

    modifier withRequiredName(string memory _name) {
        require(keccak256(abi.encodePacked(_name)) != keccak256(abi.encodePacked("")), "Name is required");
        _;
    }

    function addTeacher(address _teacher, string memory _name, string memory _subject ) onlyOwner withRequiredName(_name) withValidSubject(_subject) external {
        require(bytes(teachers[_teacher].name).length == 0, "Already exists");
        teachers[_teacher] = Teacher(_name, subjectFromString(_subject));
    }

    function setTeacher(address _teacher, string memory _name, string memory _subject) onlyOwner withRequiredName(_name) withValidSubject(_subject) external {
        require(bytes(teachers[_teacher].name).length != 0, "Not yet exists");
        teachers[_teacher] = Teacher(_name, subjectFromString(_subject));
    }

    function deleteTeacher(address _teacher) external {
        delete teachers[_teacher];
    }




    function addStudent(address _student, string memory _name ) onlyOwner withRequiredName(_name) external {
        require(bytes(students[_student].name).length == 0, "Already exists");
        students[_student] = Student(_name);
    }

    function setStudent(address _student, string memory _name ) onlyOwner withRequiredName(_name) external {
        require(bytes(students[_student].name).length != 0, "Not yet exists");
        students[_student].name = _name;
    }

    function deleteStudent(address _student) external {
        delete teachers[_student];
    }


    function gradeStudent(address _student, uint _grade) external {
        require(bytes(teachers[msg.sender].name).length != 0, "You are not a teacher ;)");
        require(bytes(students[_student].name).length != 0, "It's not a student");
        require(students[_student].grades[teachers[msg.sender].subject].initialized == false, "Subject already graded");
        students[_student].grades[teachers[msg.sender].subject].grade = _grade;
    }

    function subjectFromString(string memory _subject) pure private returns (Subjects) {
        bytes32 subject = keccak256(abi.encodePacked(_subject));
        if ( subject == keccak256(abi.encodePacked("maths")) ) return Subjects.Maths;
        if ( subject == keccak256(abi.encodePacked("bio")) ) return Subjects.Bio;
        if ( subject == keccak256(abi.encodePacked("geo")) ) return Subjects.Geo;
        return Subjects.undefined;
    }

}

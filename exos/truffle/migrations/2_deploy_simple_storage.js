// const SimpleStorage = artifacts.require("SimpleStorage");
//
// module.exports = function (deployer) {
//     deployer.deploy(SimpleStorage);
// };

const StudentNotation = artifacts.require("StudentNotation");

module.exports = function (deployer) {
    deployer.deploy(StudentNotation);
};

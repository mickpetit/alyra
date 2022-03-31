const assert = require("assert");
const {expectRevert, expectEvent, BN} = require("@openzeppelin/test-helpers");
const StudentNotation = artifacts.require("./StudentNotation.sol");
const { expect } = require('chai');

contract("StudentNotation", (accounts) => {

    let instance;
    let sender = accounts[0];

    let studentName = 'toto';
    let studentNote = 10;

    describe ("test complet", () => {

        beforeEach(async () => {
            instance = await StudentNotation.new({ from: sender });
            await instance.addStudent(accounts[1], studentName, studentNote);
            await instance.addStudent(accounts[2], 'titi', 9);
            await instance.addStudent(accounts[2], 'tutu', 20);
        });

        it("...should launch.", async () => {
            expect(true).to.be.true;
        });

        it("...should set student with mapping", async () => {
            const result = await instance.studentsMapping.call(accounts[1]);
            expect(result.name).to.be.equal(studentName);
            expect(new BN(result.note)).to.be.bignumber.equal(new BN(studentNote));
        });

        it("...should set student from array", async () => {
            const result = await instance.studentsArray.call(0);
            expect(result.name).to.be.equal(studentName);
            expect(new BN(result.note)).to.be.bignumber.equal(new BN(studentNote));
        });

        it("...should get student from mapping", async () => {
            const result = await instance.getFromMapping.call(accounts[1]);
            expect(result.name).to.be.equal(studentName);
            expect(new BN(result.note)).to.be.bignumber.equal(new BN(studentNote));
        });

        it("...should get student with array", async () => {
            const result = await instance.getFromArray.call(studentName);
            expect(result.name).to.be.equal(studentName);
            expect(new BN(result.note)).to.be.bignumber.equal(new BN(studentNote));
        });

        it.only("...should delete student inside array", async () => {
            await instance.deleteStudent.call(accounts[1]);
            const resultFromCall = await instance.getFromArray.call(0);
            const resultFromVariable = await instance.studentsArray.call(0);
            console.debug(resultFromCall);
            console.debug(resultFromVariable);
            expect(resultFromCall.name).to.be.equal('');
        });

        it("...should delete student inside mapping", async () => {
            await instance.deleteStudent.call(accounts[1]);
            const resultFromCall = await instance.getFromMapping.call(accounts[1]);
            const resultFromVariable = await instance.studentsMapping.call(accounts[1]);
            console.debug(resultFromCall);
            console.debug(resultFromVariable);
            expect(resultFromCall.name).to.be.equal('');
        });

    });
});

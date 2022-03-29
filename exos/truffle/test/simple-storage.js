const assert = require("assert");
const {expectRevert, expectEvent, BN} = require("@openzeppelin/test-helpers");
const SimpleStorage = artifacts.require("./SimpleStorage.sol");
const { expect } = require('chai');

contract("SimpleStorage", ([sender, receiver]) => {

    let instance;

    describe ("test complet", () => {

        beforeEach(async () => {
            instance = await SimpleStorage.new({ from: sender });
        });

        it("...should store the value 89.", async () => {
            const value = 89;
            // Set value of 89
            await instance.set(value, { from: sender });

            // Get stored value
            const storedData = await instance.get.call();

            expect(new BN(value)).to.be.bignumber.equal(new BN(value));

            assert.equal(storedData, value, "The value 89 was not stored.");
        });

        it("...should reject for null or 0 value set", async () => {
            await expectRevert(
                instance.set(0, { from: sender }),
                'vous ne pouvez pas mettre une valeur nulle'
            );
        });

        it("...should send event", async () => {
            const value = 10;
            const receipt = await instance.set(value, { from: sender });

            expectEvent(receipt, 'dataStored', {
                _data: new BN(value),
                _addr: sender
            })
        });
    });
});

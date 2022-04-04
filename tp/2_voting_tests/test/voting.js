const { BN, ether, expectRevert, expectEvent } = require('@openzeppelin/test-helpers');
const { expect } = require('chai');
const Voting = artifacts.require('Voting');

contract('Voting Contract Test Suite', accounts => {

    let instance, result;
    const owner = accounts[0];
    const voter1 = accounts[1];
    const voter2 = accounts[2];
    const voter3 = accounts[3];

    const WorkflowStates = Object.freeze({
        'RegisteringVoters':0,
        'ProposalsRegistrationStarted':1,
        'ProposalsRegistrationEnded':2,
        'VotingSessionStarted': 3,
        'VotingSessionEnded': 4,
        'VotesTallied': 5
    });

    function buildNewInstance() {
        return Voting.new({ from: owner });
    }

    describe.skip('Test basics', function () {
        it('should be valid to test mechanism', () => {
            expect(true).to.be.true;
        });
        /**
         * @todo
         */
        it('should create a new contract instance', async () => {
            const instance = await buildNewInstance();
            // console.debug('instance:', instance)
        });
    });

    describe('Test initial state "RegisteringVoters"', function () {

        let instance;

        before(async () => {
            instance = await buildNewInstance();
        });

        describe.skip('getVoters function: check parameters and requires only', function () {
            it('should require 1 parameter', async () => {
                await expectRevert( instance.getVoter(), 'Invalid number of parameters for "getVoter". Got 0 expected 1!');
            });
            it('should require an address as parameter', async () => {
                await expectRevert( instance.getVoter('test'), 'invalid address (argument="address", value="test", code=INVALID_ARGUMENT, version=address/5.0.5) (argument="_addr", value="test", code=INVALID_ARGUMENT, version=abi/5.0.7)' );
            });
            it('should reject for voter not yet added into whitelist', async () => {
                await expectRevert( instance.getVoter(voter1, {from: owner}), 'You\'re not a voter' );
            });
        });

        describe.skip('addVoter function: insert voter into the voters list', function () {
            let result;
            it('should require 1 parameter', async () => {
                await expectRevert( instance.addVoter(), 'Invalid number of parameters for "addVoter". Got 0 expected 1!');
            });
            it('should require an address as parameter', async () => {
                await expectRevert( instance.addVoter('test'), 'invalid address (argument="address", value="test", code=INVALID_ARGUMENT, version=address/5.0.5) (argument="_addr", value="test", code=INVALID_ARGUMENT, version=abi/5.0.7)' );
            });
            it('should be restricted to owner only', async () => {
                await expectRevert( instance.addVoter(voter1, {from: voter1}), 'Ownable: caller is not the owner.' );
            });
            it('should add one voter and return it', async () => {
                await instance.addVoter(voter1, {from: owner});
                const voter = await instance.getVoter(voter1, {from: voter1});
                expect(voter.isRegistered).to.be.true;
            });
            it('should add second voter', async () => {
                await instance.addVoter(voter2, {from: owner});
                const voter = await instance.getVoter(voter2, {from: voter1});
                expect(voter.isRegistered).to.be.true;
            });
            it('should add multiples voters', async () => {
                result = await instance.addVoter(voter3, {from: owner});
                const voter = await instance.getVoter(voter3, {from: voter1});
                expect(voter.isRegistered).to.be.true;
            });
            it('should not add a previously added voter', async () => {
                expectRevert(instance.addVoter(voter3, {from: owner}), 'Already registered');
            });
            it('should emit "VoterRegistered" event', async () => {
                expectEvent(result, 'VoterRegistered', {voterAddress: voter3});
            })

        });

        describe.skip('getVoters function: check return data', function () {

            describe('should return default voter data for voter not yet added', function () {
                before(async () => {
                    instance = await buildNewInstance();
                    await instance.addVoter(voter1, {from: owner});
                });

                it('should contain isRegistered to be false', async () => {
                    const voter = await instance.getVoter(voter2, {from: voter1});
                    expect(voter.isRegistered).to.be.false;
                });
                it('should contain hasVoted to be false', async () => {
                    const voter = await instance.getVoter(voter2, {from: voter1});
                    expect(voter.hasVoted).to.be.false;
                });
                it('should contain votedProposalId to be default string', async () => {
                    const voter = await instance.getVoter(voter2, {from: voter1});
                    expect(voter.votedProposalId).to.be.equal('0');
                });
            });

            describe('should return voter data for voter previously added', function () {

                before(async () => {
                    instance = await buildNewInstance();
                    await instance.addVoter(voter1, {from: owner});
                    await instance.addVoter(voter2, {from: owner});
                });

                it('should contain isRegistered to be true', async () => {
                    const voter = await instance.getVoter(voter1, {from: voter2});
                    expect(voter.isRegistered).to.be.true;
                });
                it('should contain hasVoted to be false', async () => {
                    const voter = await instance.getVoter(voter1, {from: voter2});
                    expect(voter.hasVoted).to.be.false;
                });
                it('should contain votedProposalId to be default string', async () => {
                    const voter = await instance.getVoter(voter1, {from: voter2});
                    expect(voter.votedProposalId).to.be.equal('0');
                });
            });

        });

    });

    describe('Test state "ProposalsRegistrationStarted"', function () {
        let instance;

        before(async () => {
            instance = await buildNewInstance();
            await instance.addVoter(voter1, {from: owner});
            await instance.startProposalsRegistering({from: owner});
        });

        describe('addProposal function', function () {
            it('should reject for voter not yet added into whitelist', async () => {
                await expectRevert( instance.addProposal(voter1, {from: owner}), 'You\'re not a voter' );
            });
            it('should require 1 parameter', async () => {
                await expectRevert( instance.addProposal('', {from: voter1}), 'Vous ne pouvez pas ne rien proposer.');
            });
            describe('should emit "ProposalRegistered" event', () => {
                let tx1, tx2, tx3;
                before(async () => {
                    tx1 = await instance.addProposal('my proposal 1', {from: voter1});
                    tx2 = await instance.addProposal('my proposal 2', {from: voter1});
                    tx3 = await instance.addProposal('my proposal 3', {from: voter1});
                });

                it('should emit "ProposalRegistered" event with proposalId 1', async () => {
                    expectEvent(tx1, 'ProposalRegistered', {0: new BN(0)});
                });
                it('should emit "ProposalRegistered" event with proposalId 2', async () => {
                    expectEvent(tx2, 'ProposalRegistered', {0: new BN(1)});
                });
                it('should emit "ProposalRegistered" event with proposalId 3', async () => {
                    expectEvent(tx3, 'ProposalRegistered', {0: new BN(2)});
                });
            })
        });

        describe('getOneProposal function', function () {

        });
    });

    describe.skip('Test workflow mechanisms', function () {

        describe('Step 1: "RegisteringVoters"', function () {
            before(async () => {
                instance = await buildNewInstance();
                await instance.addVoter(voter1, {from: owner});
            });

            it('should be initialized with "RegisteringVoters"', async () => {
                expect(await instance.workflowStatus()).to.be.bignumber.equal(new BN(WorkflowStates.RegisteringVoters));
            });
            it('should reject "addProposal" function', async () => {
                await expectRevert(instance.addProposal('test', {from: voter1}), 'Proposals are not allowed yet');
            });
            it('should reject "endProposalsRegistering" function', async () => {
                await expectRevert(instance.endProposalsRegistering({from: owner}), 'Registering proposals havent started yet');
            });
            it('should reject "startVotingSession" function', async () => {
                await expectRevert(instance.startVotingSession({from: owner}), 'Registering proposals phase is not finished');
            });
            it('should reject "setVote" function', async () => {
                await expectRevert(instance.setVote(1, {from: voter1}), 'Voting session havent started yet');
            });
            it('should reject "endVotingSession" function', async () => {
                await expectRevert(instance.endVotingSession({from: owner}), 'Voting session havent started yet');
            });
            it('should reject "tallyVotes" function', async () => {
                await expectRevert(instance.tallyVotes({from: owner}), 'Current status is not voting session ended');
            });
        });

        describe('Step 2: "ProposalsRegistrationStarted"', function () {
            let result;

            before(async () => {
                instance = await buildNewInstance();
                await instance.addVoter(voter1, {from: owner});
            });

            it('should be rejected for not owner', async () => {
                await expectRevert(instance.startProposalsRegistering({from: voter1}), 'Ownable: caller is not the owner.');
            });
            it('should update internal state to "ProposalsRegistrationStarted"', async () => {
                result = await instance.startProposalsRegistering({from: owner});
                expect(await instance.workflowStatus()).to.be.bignumber.equal(new BN(WorkflowStates.ProposalsRegistrationStarted));
            });
            it('should emit a "WorkflowStatusChange" status change event', async () => {
                expectEvent(result, 'WorkflowStatusChange', {previousStatus: new BN(WorkflowStates.RegisteringVoters), newStatus: new BN(WorkflowStates.ProposalsRegistrationStarted)})
            });
            it('should reject "addVoter" function', async () => {
                await expectRevert(instance.addVoter(voter1, {from: owner}), 'Voters registration is not open yet');
            });
            it('should reject "startProposalsRegistering" function', async () => {
                await expectRevert(instance.startProposalsRegistering({from: owner}), 'Registering proposals cant be started now');
            });
            it('should reject "startVotingSession" function', async () => {
                await expectRevert(instance.startVotingSession({from: owner}), 'Registering proposals phase is not finished');
            });
            it('should reject "setVote" function', async () => {
                await expectRevert(instance.setVote(1, {from: voter1}), 'Voting session havent started yet');
            });
            it('should reject "endVotingSession" function', async () => {
                await expectRevert(instance.endVotingSession({from: owner}), 'Voting session havent started yet');
            });
            it('should reject "tallyVotes" function', async () => {
                await expectRevert(instance.tallyVotes({from: owner}), 'Current status is not voting session ended');
            });
        });

        describe('Step 3: "endProposalsRegistering"', function () {
            let result;
            before(async () => {
                instance = await buildNewInstance();
                await instance.addVoter(voter1, {from: owner});
                await instance.startProposalsRegistering({from: owner});
            });

            it('should be rejected for not owner', async () => {
                await expectRevert(instance.endProposalsRegistering({from: voter1}), 'Ownable: caller is not the owner.');
            });
            it('should update internal state to "ProposalsRegistrationEnded"', async () => {
                result = await instance.endProposalsRegistering({from: owner});
                expect(await instance.workflowStatus()).to.be.bignumber.equal(new BN(WorkflowStates.ProposalsRegistrationEnded));
            });
            it('should emit a "WorkflowStatusChange" status change event', async () => {
                expectEvent(result, 'WorkflowStatusChange', {previousStatus: new BN(WorkflowStates.ProposalsRegistrationStarted), newStatus: new BN(WorkflowStates.ProposalsRegistrationEnded)})
            });
            it('should reject "addVoter" function', async () => {
                await expectRevert(instance.addVoter(voter1, {from: owner}), 'Voters registration is not open yet');
            });
            it('should reject "startProposalsRegistering" function', async () => {
                await expectRevert(instance.startProposalsRegistering({from: owner}), 'Registering proposals cant be started now');
            });
            it('should reject "addProposal" function', async () => {
                await expectRevert(instance.addProposal('test', {from: voter1}), 'Proposals are not allowed yet');
            });
            it('should reject "endProposalsRegistering" function', async () => {
                await expectRevert(instance.endProposalsRegistering({from: owner}), 'Registering proposals havent started yet');
            });
            it('should reject "endVotingSession" function', async () => {
                await expectRevert(instance.endVotingSession({from: owner}), 'Voting session havent started yet');
            });
            it('should reject "tallyVotes" function', async () => {
                await expectRevert(instance.tallyVotes({from: owner}), 'Current status is not voting session ended');
            });
        });

        describe('Step 4: "startVotingSession"', function () {
            let result;
            before(async () => {
                instance = await buildNewInstance();
                await instance.addVoter(voter1, {from: owner});
                await instance.startProposalsRegistering({from: owner});
                await instance.endProposalsRegistering({from: owner});
            });

            it('should be rejected for not owner', async () => {
                await expectRevert(instance.startVotingSession({from: voter1}), 'Ownable: caller is not the owner.');
            });
            it('should update internal state to "VotingSessionStarted"', async () => {
                result = await instance.startVotingSession({from: owner});
                expect(await instance.workflowStatus()).to.be.bignumber.equal(new BN(WorkflowStates.VotingSessionStarted));
            });
            it('should emit a "WorkflowStatusChange" status change event', async () => {
                expectEvent(result, 'WorkflowStatusChange', {previousStatus: new BN(WorkflowStates.ProposalsRegistrationEnded), newStatus: new BN(WorkflowStates.VotingSessionStarted)})
            });
            it('should reject "addVoter" function', async () => {
                await expectRevert(instance.addVoter(voter1, {from: owner}), 'Voters registration is not open yet');
            });
            it('should reject "startProposalsRegistering" function', async () => {
                await expectRevert(instance.startProposalsRegistering({from: owner}), 'Registering proposals cant be started now');
            });
            it('should reject "addProposal" function', async () => {
                await expectRevert(instance.addProposal('test', {from: voter1}), 'Proposals are not allowed yet');
            });
            it('should reject "endProposalsRegistering" function', async () => {
                await expectRevert(instance.endProposalsRegistering({from: owner}), 'Registering proposals havent started yet');
            });
            it('should reject "startVotingSession" function', async () => {
                await expectRevert(instance.startVotingSession({from: owner}), 'Registering proposals phase is not finished');
            });
            it('should reject "tallyVotes" function', async () => {
                await expectRevert(instance.tallyVotes({from: owner}), 'Current status is not voting session ended');
            });
        });

        describe('Step 4: "endVotingSession"', function () {
            let result;
            before(async () => {
                instance = await buildNewInstance();
                await instance.addVoter(voter1, {from: owner});
                await instance.startProposalsRegistering({from: owner});
                await instance.endProposalsRegistering({from: owner});
                await instance.startVotingSession({from: owner});
            });

            it('should be rejected for not owner', async () => {
                await expectRevert(instance.endVotingSession({from: voter1}), 'Ownable: caller is not the owner.');
            });
            it('should update internal state to "VotingSessionEnded"', async () => {
                result = await instance.endVotingSession({from: owner});
                expect(await instance.workflowStatus()).to.be.bignumber.equal(new BN(WorkflowStates.VotingSessionEnded));
            });
            it('should emit a "WorkflowStatusChange" status change event', async () => {
                expectEvent(result, 'WorkflowStatusChange', {previousStatus: new BN(WorkflowStates.VotingSessionStarted), newStatus: new BN(WorkflowStates.VotingSessionEnded)})
            });
            it('should reject "addVoter" function', async () => {
                await expectRevert(instance.addVoter(voter1, {from: owner}), 'Voters registration is not open yet');
            });
            it('should reject "startProposalsRegistering" function', async () => {
                await expectRevert(instance.startProposalsRegistering({from: owner}), 'Registering proposals cant be started now');
            });
            it('should reject "addProposal" function', async () => {
                await expectRevert(instance.addProposal('test', {from: voter1}), 'Proposals are not allowed yet');
            });
            it('should reject "endProposalsRegistering" function', async () => {
                await expectRevert(instance.endProposalsRegistering({from: owner}), 'Registering proposals havent started yet');
            });
            it('should reject "startVotingSession" function', async () => {
                await expectRevert(instance.startVotingSession({from: owner}), 'Registering proposals phase is not finished');
            });
            it('should reject "setVote" function', async () => {
                await expectRevert(instance.setVote(1, {from: voter1}), 'Voting session havent started yet');
            });
            it('should reject "endVotingSession" function', async () => {
                await expectRevert(instance.endVotingSession({from: owner}), 'Voting session havent started yet');
            });
        });

        describe('Step 5: "tallyVotes"', function () {
            let result;
            before(async () => {
                instance = await buildNewInstance();
                await instance.addVoter(voter1, {from: owner});
                await instance.startProposalsRegistering({from: owner});
                await instance.endProposalsRegistering({from: owner});
                await instance.startVotingSession({from: owner});
                await instance.endVotingSession({from: owner});
            });

            it('should be rejected for not owner', async () => {
                await expectRevert(instance.endVotingSession({from: voter1}), 'Ownable: caller is not the owner.');
            });
            it('should update internal state to "VotingSessionEnded"', async () => {
                result = await instance.tallyVotes({from: owner});
                expect(await instance.workflowStatus()).to.be.bignumber.equal(new BN(WorkflowStates.VotesTallied));
            });
            it('should emit a "WorkflowStatusChange" status change event', async () => {
                expectEvent(result, 'WorkflowStatusChange', {previousStatus: new BN(WorkflowStates.VotingSessionEnded), newStatus: new BN(WorkflowStates.VotesTallied)})
            });
            it('should reject "addVoter" function', async () => {
                await expectRevert(instance.addVoter(voter1, {from: owner}), 'Voters registration is not open yet');
            });
            it('should reject "startProposalsRegistering" function', async () => {
                await expectRevert(instance.startProposalsRegistering({from: owner}), 'Registering proposals cant be started now');
            });
            it('should reject "addProposal" function', async () => {
                await expectRevert(instance.addProposal('test', {from: voter1}), 'Proposals are not allowed yet');
            });
            it('should reject "endProposalsRegistering" function', async () => {
                await expectRevert(instance.endProposalsRegistering({from: owner}), 'Registering proposals havent started yet');
            });
            it('should reject "setVote" function', async () => {
                await expectRevert(instance.setVote(1, {from: voter1}), 'Voting session havent started yet');
            });
            it('should reject "startVotingSession" function', async () => {
                await expectRevert(instance.startVotingSession({from: owner}), 'Registering proposals phase is not finished');
            });
            it('should reject "endVotingSession" function', async () => {
                await expectRevert(instance.endVotingSession({from: owner}), 'Voting session havent started yet');
            });
            it('should reject "tallyVotes" function', async () => {
                await expectRevert(instance.tallyVotes({from: owner}), 'Current status is not voting session ended');
            });
        });

    });


});

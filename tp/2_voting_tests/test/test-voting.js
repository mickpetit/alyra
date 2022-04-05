const { BN, ether, expectRevert, expectEvent } = require('@openzeppelin/test-helpers');
const { expect } = require('chai');
const TestVoting = artifacts.require('Voting');

contract('Voting Contract Test Suite', accounts => {

    let instance, result;
    const owner = accounts[0];
    const voter1 = accounts[1];
    const voter2 = accounts[2];
    const voter3 = accounts[3];
    const voter4 = accounts[4];
    const voter5 = accounts[5];
    const voter6 = accounts[6];
    const voter7 = accounts[7];
    const voter8 = accounts[8];
    let proposal1Description = 'my proposal 1';
    let proposal2Description = 'my proposal 2';
    let proposal3Description = 'my proposal 3';

    const WorkflowStates = Object.freeze({
        'RegisteringVoters':0,
        'ProposalsRegistrationStarted':1,
        'ProposalsRegistrationEnded':2,
        'VotingSessionStarted': 3,
        'VotingSessionEnded': 4,
        'VotesTallied': 5
    });

    function buildNewInstance() {
        return TestVoting.new({ from: owner });
    }

    describe('Test basics', function () {
        it('should be valid to test mechanism', () => {
            expect(true).to.be.true;
        });
        it('should create a new contract instance', async () => {
            const instance = await buildNewInstance();
            expect(instance.address).to.be.not.null;
        });
    });

    describe('Test initial state "RegisteringVoters"', function () {

        let instance;

        before(async () => {
            instance = await buildNewInstance();
        });

        describe('getVoters function: check parameters and requires only', function () {
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

        describe('addVoter function: insert voter into the voters list', function () {
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

        describe('getVoters function: check return data', function () {

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
                let voterResponse;
                before(async () => {
                    instance = await buildNewInstance();
                    await instance.addVoter(voter1, {from: owner});
                    await instance.addVoter(voter2, {from: owner});
                    voterResponse = await instance.getVoter(voter1, {from: voter2});
                });

                it('should contain isRegistered to be true', async () => {
                    expect(voterResponse.isRegistered).to.be.true;
                });
                it('should contain hasVoted to be false', async () => {
                    expect(voterResponse.hasVoted).to.be.false;
                });
                it('should contain votedProposalId to be default string', async () => {
                    expect(voterResponse.votedProposalId).to.be.equal('0');
                });
            });

        });

    });

    describe('Test state "ProposalsRegistrationStarted"', function () {
        let instance;

        describe('addProposal function', function () {
            before(async () => {
                instance = await buildNewInstance();
                await instance.addVoter(voter1, {from: owner});
                await instance.addVoter(voter2, {from: owner});
                await instance.addVoter(voter3, {from: owner});
                await instance.startProposalsRegistering({from: owner});
            });

            it('should reject for voter not yet added into whitelist', async () => {
                await expectRevert( instance.addProposal(voter1, {from: owner}), 'You\'re not a voter' );
            });
            it('should require 1 parameter', async () => {
                await expectRevert( instance.addProposal('', {from: voter1}), 'Vous ne pouvez pas ne rien proposer.');
            });
            describe('should emit "ProposalRegistered" event', () => {
                let tx1, tx2, tx3;
                before(async () => {
                    tx1 = await instance.addProposal(proposal1Description, {from: voter1});
                    tx2 = await instance.addProposal(proposal2Description, {from: voter2});
                    tx3 = await instance.addProposal(proposal3Description, {from: voter3});
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
                it('should allow multiple proposals from same voter', async () => {
                    let tx = await instance.addProposal(proposal3Description, {from: voter1});
                    expectEvent(tx, 'ProposalRegistered', {0: new BN(3)});
                });
            })
        });

        describe('getOneProposal function', function () {
            before(async () => {
                instance = await buildNewInstance();
                await instance.addVoter(voter1, {from: owner});
                await instance.startProposalsRegistering({from: owner});
            });

            it('should reject for proposal not yet added into whitelist', async () => {
                await expectRevert( instance.getOneProposal(0, {from: voter3}), 'You\'re not a voter' );
            });
            it('should require 1 parameter', async () => {
                await expectRevert( instance.getOneProposal(0, 10, {from: voter1}), 'Invalid number of parameters for "getOneProposal". Got 2 expected 1!');
            });
            it('should reject negative proposal id', async () => {
                await expectRevert( instance.getOneProposal(-10, {from: voter1}), 'value out-of-bounds (argument="_id", value=-10, code=INVALID_ARGUMENT, version=abi/5.0.7)');
            });
            it('should reject proposal id out of bounds', async () => {
                await expectRevert.unspecified( instance.getOneProposal(100, {from: voter1}));
            });

            describe('should return voter data for voter previously added', function () {
                let proposal1Response, proposal2Response, proposal3Response;
                before(async () => {
                    instance = await buildNewInstance();
                    await instance.addVoter(voter1, {from: owner});
                    await instance.addVoter(voter2, {from: owner});
                    await instance.addVoter(voter3, {from: owner});
                    await instance.startProposalsRegistering({from: owner});
                    await instance.addProposal(proposal1Description, {from: voter1});
                    await instance.addProposal(proposal2Description, {from: voter2});
                    await instance.addProposal(proposal3Description, {from: voter3});
                    proposal1Response = await instance.getOneProposal(0, {from: voter1});
                    proposal2Response = await instance.getOneProposal(1, {from: voter1});
                    proposal3Response = await instance.getOneProposal(2, {from: voter1});
                });

                describe('should be a valid description response', function () {
                    it('should contain description to be ' + proposal1Description + ' string for proposal id 0', async () => {
                        expect(proposal1Response.description).to.be.string(proposal1Description);
                    });
                    it('should contain description to be ' + proposal2Description + ' string for proposal id 1', async () => {
                        expect(proposal2Response.description).to.be.string(proposal2Description);
                    });
                    it('should contain description to be ' + proposal3Description + ' string for proposal id 2', async () => {
                        expect(proposal3Response.description).to.be.string(proposal3Description);
                    });
                });
            });
        });
    });

    describe('Test state "VotingSessionStarted"', function () {
        let instance;

        describe('setVote function', function () {
            before(async () => {
                instance = await buildNewInstance();
                await instance.addVoter(voter1, {from: owner});
                await instance.addVoter(voter2, {from: owner});
                await instance.addVoter(voter3, {from: owner});
                await instance.startProposalsRegistering({from: owner});
                await instance.addProposal(proposal1Description, {from: voter1});
                await instance.addProposal(proposal2Description, {from: voter2});
                await instance.endProposalsRegistering({from: owner});
                await instance.startVotingSession({from: owner});
            });

            it('should reject for voter not yet added into whitelist', async () => {
                await expectRevert( instance.setVote(0, {from: owner}), 'You\'re not a voter' );
            });
            it('should require 1 parameter', async () => {
                await expectRevert( instance.setVote('', {from: voter1}), 'invalid BigNumber string (argument="value", value="", code=INVALID_ARGUMENT, version=bignumber/5.0.8)');
            });
            it('should revert for out of proposals boundaries (negative)', async () => {
                await expectRevert( instance.setVote(-10, {from: voter1}), 'value out-of-bounds (argument="_id", value=-10, code=INVALID_ARGUMENT, version=abi/5.0.7)');
            });
            it('should revert for out of proposals boundaries (positive)', async () => {
                await expectRevert( instance.setVote(100, {from: voter1}), 'Proposal not found');
            });
            /**
             * This test failed because require condition is '_id <= proposalsArray.length'
             * and should be '_id < proposalsArray.length' because proposalsArray start at index 0.
             */
            it('should revert for out of proposals boundaries (equal proposal size)', async () => {
                await expectRevert( instance.setVote(2, {from: voter1}), 'Proposal not found');
            });
            it('should emit "Voted" event to a valid proposal for voter 1', async () => {
                expectEvent( await instance.setVote(1, {from: voter1}), 'Voted', {voter: voter1, proposalId: new BN(1)} );
            });
            it('should emit "Voted" event to a valid proposal for voter 2', async () => {
                expectEvent( await instance.setVote(0, {from: voter2}), 'Voted', {voter: voter2, proposalId: new BN(0)} );
            });
            it('should revert for voter who already have voted', async () => {
                await expectRevert( instance.setVote(1, {from: voter2}), 'You have already voted');
            });
            it('should mark voter 1 to have voted', async () => {
                const voter = await instance.getVoter(voter1, {from: voter1});
                expect(voter.hasVoted).to.be.true;
            });
            it('should mark voter 2 to have voted', async () => {
                const voter = await instance.getVoter(voter2, {from: voter1});
                expect(voter.hasVoted).to.be.true;
            });
            it('should mark proposal id voted for into voter 1', async () => {
                const voter = await instance.getVoter(voter1, {from: voter1});
                expect(voter.votedProposalId).to.be.bignumber.equal(new BN(1));
            });
            it('should mark proposal id voted for into voter 2', async () => {
                const voter = await instance.getVoter(voter2, {from: voter1});
                expect(voter.votedProposalId).to.be.bignumber.equal(new BN(0));
            });
        });
    });

    describe('Test state "VotingSessionEnded"', function () {
        let instance;

        describe('tallyVotes function', function () {
            async function generateDefaultData() {
                instance = await buildNewInstance();
                await instance.addVoter(voter1, {from: owner});
                await instance.addVoter(voter2, {from: owner});
                await instance.addVoter(voter3, {from: owner});
                await instance.addVoter(voter4, {from: owner});
                await instance.addVoter(voter5, {from: owner});
                await instance.addVoter(voter6, {from: owner});
                await instance.addVoter(voter7, {from: owner});
                await instance.addVoter(voter8, {from: owner});
                await instance.startProposalsRegistering({from: owner});
                await instance.addProposal(proposal1Description, {from: voter1});
                await instance.addProposal(proposal2Description, {from: voter2});
                await instance.addProposal(proposal3Description, {from: voter3});
                await instance.endProposalsRegistering({from: owner});
            }

            describe('tests for global cases', function () {
                before(async () => {
                    await generateDefaultData();
                    await instance.startVotingSession({from: owner});
                    await instance.setVote(2, {from: voter1});
                    await instance.setVote(1, {from: voter2});
                    await instance.setVote(2, {from: voter3});
                    await instance.setVote(0, {from: voter4});
                    await instance.setVote(0, {from: voter5});
                    await instance.setVote(2, {from: voter6});
                    await instance.setVote(1, {from: voter7});
                    await instance.setVote(2, {from: voter8});
                    await instance.endVotingSession({from: owner});
                    /**
                     * Results:
                     * - proposal 0: 2
                     * - proposal 1: 2
                     * - proposal 2: 4
                     */
                });

                it('should restrict call to owner only', async () => {
                    await expectRevert(instance.tallyVotes({from: voter1}), 'Ownable: caller is not the owner.');
                });
                it('should emit "WorkflowStatusChange" event', async () => {
                    const tx = await instance.tallyVotes({from: owner});
                    expectEvent(tx, 'WorkflowStatusChange', {previousStatus: new BN(WorkflowStates.VotingSessionEnded), newStatus: new BN(WorkflowStates.VotesTallied)});
                });
                it('should set the winning proposal id as public', async () => {
                    expect(await instance.winningProposalID()).to.be.bignumber.equal(new BN(2))
                });
            });

            describe('tests for no voters case', function () {
                before(async () => {
                    await generateDefaultData();
                    await instance.startVotingSession({from: owner});
                    await instance.setVote(1, {from: voter2});
                    await instance.setVote(0, {from: voter4});
                    await instance.setVote(0, {from: voter5});
                    await instance.setVote(1, {from: voter7});
                    await instance.endVotingSession({from: owner});
                    /**
                     * Results:
                     * - proposal 0: 2
                     * - proposal 1: 2
                     * - proposal 2: 4
                     */
                });

                it('should emit "WorkflowStatusChange" event', async () => {
                    const tx = await instance.tallyVotes({from: owner});
                    expectEvent(tx, 'WorkflowStatusChange', {previousStatus: new BN(WorkflowStates.VotingSessionEnded), newStatus: new BN(WorkflowStates.VotesTallied)});
                });
                it('should set the winning proposal id as first proposal set', async () => {
                    expect(await instance.winningProposalID()).to.be.bignumber.equal(new BN(0))
                });
            });

            describe('tests for equal result for 2 proposals', function () {
                before(async () => {
                    await generateDefaultData();
                    await instance.startVotingSession({from: owner});
                    await instance.endVotingSession({from: owner});
                    /**
                     * Results:
                     * - proposal 0: 0
                     * - proposal 1: 0
                     * - proposal 2: 0
                     */
                });

                it('should emit "WorkflowStatusChange" event', async () => {
                    const tx = await instance.tallyVotes({from: owner});
                    expectEvent(tx, 'WorkflowStatusChange', {previousStatus: new BN(WorkflowStates.VotingSessionEnded), newStatus: new BN(WorkflowStates.VotesTallied)});
                });
                it('should set the winning proposal id as first proposal set', async () => {
                    expect(await instance.winningProposalID()).to.be.bignumber.equal(new BN(0))
                });
            });



        })
    });

    describe('Test workflow mechanisms', function () {

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

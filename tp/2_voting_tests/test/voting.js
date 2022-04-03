const { BN, ether, expectRevert, expectEvent } = require('@openzeppelin/test-helpers');
const { expect } = require('chai');
const Voting = artifacts.require('Voting');

contract('Voting Contract Test Suite', async accounts => {

    let instance;
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

    const WorkflowInstances = {};

    function buildNewInstance() {
        return Voting.new({ from: owner });
    }

    async function attachVoters(instance) {
        await instance.addVoter.call(voter1);
        await instance.addVoter.call(voter2);
        await instance.addVoter.call(voter3);
    }

    describe('Test basics', () => {
        it('should be valid to test mechanism', function () {
            expect(true).to.be.true;
        });
        /**
         * @todo
         */
        it('should create a new contract instance', async function () {
            const instance = await buildNewInstance();
            // console.debug('instance:', instance)
        });
    });

    describe('Test initial state "RegisteringVoters"', () => {

        let instance;

        before(async () => {
            instance = await buildNewInstance();
        });

        describe('getVoters function: check parameters and requires only', async () => {
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

        describe('addVoter function: insert voter into the voters list', () => {

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
                const response = await instance.getVoter(voter1, {from: voter1});
                expect(response.isRegistered).to.be.true;
            });

            it('should add second voter', () => {

            });

            it('should add multiples voters', () => {

            });

            it('can add a previously added voter', () => {

            });

        });

        describe('getVoters function: check return data', async () => {

            describe('should return default voter data for voter not yet added', async () => {

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

            describe('should return voter data for voter previously added', async () => {

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

        describe('should reject other functions restricted to other workflow state', async () => {

            before(async () => {
                instance = await buildNewInstance();
                await instance.addVoter(voter1, {from: owner});
            });

            it('should reject "addProposal" function', async () => {
                await expectRevert(instance.addProposal('test', {from: voter1}), 'Proposals are not allowed yet');
            });
            it('should reject "setVote" function', async () => {
                await expectRevert(instance.setVote(1, {from: voter1}), 'Voting session havent started yet');
            });
            it('should reject "endProposalsRegistering" function', async () => {
                await expectRevert(instance.endProposalsRegistering({from: owner}), 'Registering proposals havent started yet');
            });
            it('should reject "startVotingSession" function', async () => {
                await expectRevert(instance.startVotingSession({from: owner}), 'Registering proposals phase is not finished');
            });
            it('should reject "endVotingSession" function', async () => {
                await expectRevert(instance.endVotingSession({from: owner}), 'Voting session havent started yet');
            });
        })
    });

    describe('Test function "ProposalsRegistrationStarted" to go the the second state', function () {

        before(async () => {
            instance = await buildNewInstance();
        })

        it('should be rejected for not owner', async () => {
            await expectRevert(instance.startProposalsRegistering({from: voter1}), 'Ownable: caller is not the owner.');
        });

        it('should emit a "WorkflowStatusChange" status change event', async () => {
            const result = await instance.startProposalsRegistering({from: owner});
            expectEvent(result, 'WorkflowStatusChange', {previousStatus: new BN(WorkflowStates.RegisteringVoters), newStatus: new BN(WorkflowStates.ProposalsRegistrationStarted)})
        });
    });






    // describe('State "ProposalsRegistrationStarted"', () => {
    //
    //     before(async () => {
    //         const instance = await buildNewInstance();
    //         attachVoters(instance);
    //         await instance.startProposalsRegistering.call();
    //         WorkflowInstances[WorkflowStates.ProposalsRegistrationStarted] = instance;
    //         console.debug('status:',
    //             new BN(await WorkflowInstances[WorkflowStates.RegisteringVoters].workflowStatus.call()).toString()
    //         );
    //     });
    //
    //     it('should be completed...', function () {
    //
    //     });
    //
    // });
    //
    // describe('States workflow', async () => {
    //
    //     const WORKFLOW_ALLOWED_MAPPING = [
    //         {
    //             title: 'add voters',
    //             allowed: [WorkflowStates.RegisteringVoters],
    //             callback: async (o) => {
    //                 if ( o !== undefined ) {
    //                     console.debug('workflowStatus: ', new BN(await WorkflowInstances[WorkflowStates.RegisteringVoters].workflowStatus.call()).toString());
    //                 }
    //
    //                 return (o ?? WorkflowInstances[WorkflowStates.RegisteringVoters]).addVoter(voter1)
    //             }
    //         }
    //     ];
    //
    //     WORKFLOW_ALLOWED_MAPPING.map(action => {
    //         // perform allowed match
    //         Object.entries(WorkflowStates).filter(([key, value]) => action.allowed.includes(value)).map( state => {
    //             it(`should do '${action.title}' on '${state[0]}' state`, async function () {
    //                 expect(await action.callback()).to.be.not.empty;
    //             });
    //         });
    //         // perform reject match
    //         Object.entries(WorkflowStates).filter(([key, value]) => !action.allowed.includes(value)).map( state => {
    //             it(`should not do '${action.title}' on '${state[0]}' state`, async function () {
    //                 await expectRevert(action.callback(WorkflowInstances[state[1]]), 'test');
    //             });
    //         });
    //     });
    // });
});

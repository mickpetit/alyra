const { BN, ether, expectRevert } = require('@openzeppelin/test-helpers');
const { expect } = require('chai');
const Voting = artifacts.require('Voting');

contract('Voting Contract Test Suite', async accounts => {

    let instance;
    const owner = accounts[0];
    const voter1 = accounts[1];
    const voter2 = accounts[2];
    const voter3 = accounts[3];

    const WorkflowStates = Object.freeze({
        'RegisteringVoters':1,
        'ProposalsRegistrationStarted':2,
        'ProposalsRegistrationEnded':3,
        'VotingSessionStarted': 4,
        'VotingSessionEnded': 5,
        'VotesTallied': 6
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
        it('should be valid for to test mechanism', function () {
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


        describe('Add voters into whitelist', () => {
            it('should be restrict to owner only', () => {

            });

            it('should add one voter', () => {

            });

            it('should add second voter', () => {

            });

            it('should add multiples voters', () => {

            });

            it('can add a previously added voter', () => {

            });

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

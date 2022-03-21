// SPDX-License-Identifier: GPL-3.0

pragma solidity 0.8.13;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./AllowablesList.sol";
import "./WinnableProposalsList.sol";


contract Voting is Ownable, AllowablesList, WinnableProposalsList {

    /**
     * Mapping to store history of winners.
     * Public visibility automatically add getter :).
     */
    mapping (uint => Proposal) public winnersHistory;

    /**
     * Id of voting session.
     * Use this parameter to retrieve
     * previous winners in the history.
     * Be carreful of voting session is store
     * only after vote counting ended ;).
     * Public visibility automatically add getter.
     */
    uint public votingSessionId;

    /**
     * Enum of all allowed status for workflow.
     */
    enum WorkflowStatus {
        Undefined,
        Initialized,
        RegisteringVoters,
        ProposalsRegistrationStarted,
        ProposalsRegistrationEnded,
        VotingSessionStarted,
        VotingSessionEnded,
        VotesTallied
    }

    /**
     * Current state of workflow.
     * Private visibility only.
     */
    WorkflowStatus private _state;

    event VoterRegistered (address voterAddress);
    event VoterUnregistered (address voterAddress);
    event WorkflowStatusChange (WorkflowStatus previousStatus, WorkflowStatus newStatus);
    event ProposalRegistered (uint proposalId);
    event Voted (address voter, uint proposalId);
    event ProposalWinning (Proposal);
    event NoProposalWinning ();

    event Received(address, uint);
    event LogDepositReceived(address);

    /**
     * Restrict access to workflow status.
     */
    modifier onlyStatus (WorkflowStatus state_) {
        require (_state == state_, "Internal state not allowed");
        _;
    }

    /**
     * Thanks for send me tokens :)
     * Log this event to keep history.
     *
     * Reject calls with not empty data to notice
     * callers to incorrectly used of contact.
     */
    fallback() external payable {
        require(msg.data.length == 0);
        emit LogDepositReceived(msg.sender);
    }

    /**
     * Thanks for send me tokens :)
     * Log this event to keep history.
     */
    receive() external payable {
        emit Received(msg.sender, msg.value);
    }

    /**
     * External interface for internal init function.
     */
    function init () external virtual {
        _init();
    }

    /**
     * End the proposals registration process.
     *
     * External function with onlyOwner restriction.
     * Current state must be set to 'ProposalsRegistrationStarted'.
     */
    function endProposalsRegistration ()
        onlyOwner
        onlyStatus(WorkflowStatus.ProposalsRegistrationStarted)
        external virtual
    {
        _updateWorkflowState(WorkflowStatus.ProposalsRegistrationEnded);
    }

    /**
     * End the voting session.
     *
     * External function with onlyOwner restriction.
     * Current state must be set to 'VotingSessionStarted'.
     */
    function endVotingSession ()
        onlyOwner
        onlyStatus(WorkflowStatus.VotingSessionStarted)
        external virtual
    {
        _updateWorkflowState(WorkflowStatus.VotingSessionEnded);
    }

    /**
     * Add voter into the allowed list.
     *
     * External function with onlyOwner restriction.
     * Current state must be set to 'Initialized'.
     */
    function registerVoter (address addr)
        onlyStatus(WorkflowStatus.Initialized)
        onlyOwner
        external
    {
        _allow(addr);
        emit VoterRegistered(addr);
    }

    /**
     * Store stats and init a new process.
     *
     * External function with onlyOwner restriction.
     * Current state must be set to 'VotesTallied'.
     */
    function reset()
        onlyOwner
        onlyStatus(WorkflowStatus.VotesTallied)
        external virtual
    {
        _resetCountingProcess();
        _updateWorkflowState(WorkflowStatus.Undefined);
        _init();
    }

    /**
     * Start the proposals registration process.
     *
     * External function with onlyOwner restriction.
     * Current state must be set to 'Initialized'.
     */
    function startProposalsRegistration ()
        onlyOwner
        onlyStatus(WorkflowStatus.Initialized)
        external virtual
    {
        _updateWorkflowState(WorkflowStatus.ProposalsRegistrationStarted);
    }

    /**
     * Start the voting session.
     *
     * External function with onlyOwner restriction.
     * Current state must be set to 'ProposalsRegistrationEnded'.
     */
    function startVotingSession ()
        onlyOwner
        onlyStatus(WorkflowStatus.ProposalsRegistrationEnded)
        external virtual
    {
        _updateWorkflowState(WorkflowStatus.VotingSessionStarted);
    }

    /**
     * Add a new proposal into the proposals list.
     *
     * External function with only allowed voters restriction.
     * Current state must be set to 'ProposalsRegistrationStarted'.
     */
    function submitProposal (string memory title, string memory description)
        onlyStatus(WorkflowStatus.ProposalsRegistrationStarted)
        onlyAllowed
        external virtual
    {
        uint proposalId = _createProposal(title, description, msg.sender);
        emit ProposalRegistered(proposalId);
    }

    /**
     * Vote for proposal id.
     *
     * External function with only allowed voters restriction.
     * Current state must be set to 'VotingSessionStarted'.
     * This function override extended function
     * into WinnableProposalsList smart contract.
     */
    function submitVote (uint proposalId)
        onlyStatus(WorkflowStatus.VotingSessionStarted)
        onlyAllowed
        override external virtual
    {
        _submitVote(msg.sender, proposalId);
        emit Voted(msg.sender, proposalId);
    }

    /**
     * Process votes counting.
     *
     * External function with onlyOwner restriction.
     * Current state must be set to 'VotingSessionEnded'.
     */
    function processCounting ()
        onlyOwner
        onlyStatus(WorkflowStatus.VotingSessionEnded)
        external override virtual
        returns (bool withWinner)
    {
        Proposal memory winner;
        // process counting:
        // generate event on winner found
        // otherwise generate special event for no winner found
        if ( (withWinner = _processCounting()) ) {
            winner = _getWinner();
            emit ProposalWinning (winner);
        }
        else {
            // whether no proposal found
            // (ie no proposal submitted or nobody have voted)
            // we store an empty proposal into history
            // with special title and description
            winner.title = "No proposal won this voting session";
            winner.description = "No proposal won this voting session";
            emit NoProposalWinning ();
        }

        // now we can store winner into the history
        winnersHistory[votingSessionId] = winner;

        // and mark the internal status as tallied
        _updateWorkflowState(WorkflowStatus.VotesTallied);
    }

    /**
     * Remove voter from the allowed list.
     *
     * External function with onlyOwner restriction.
     * Current state must be set to 'Initialized'.
     */
    function unregisterVoter (address addr)
        onlyStatus(WorkflowStatus.Initialized)
        onlyOwner
        external
    {
        _unauthorized(addr);
        emit VoterUnregistered(addr);
    }

    /**
     * Initialize the smart contract with
     * manager data and start the workflow
     * to the first state.
     *
     * Internal function with onlyOwner and
     * not init status restrictions.
     */
    function _init () onlyOwner onlyStatus(WorkflowStatus.Undefined) internal virtual {
        // init internal features
        _setAllowedListManager(msg.sender);
        _setProposablesListManager(msg.sender);
        _resetProposablesList();

        // FYI: AllowedList is not reset to
        // allow admin to mannually add or remove
        // previously added voters.

        // init the voting session id
        votingSessionId++;

        // and set the internal state as initialized.
        _updateWorkflowState(WorkflowStatus.Initialized);
    }

    /**
     * Update the internal state to the new one.
     *
     * Private function with onlyOwner restriction.
     */
    function _updateWorkflowState(WorkflowStatus newState) onlyOwner private {
        WorkflowStatus previousStatus = _state;
        _state = newState;
        emit WorkflowStatusChange(previousStatus, newState);
    }

}

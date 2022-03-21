// SPDX-License-Identifier: GPL-3.0

pragma solidity 0.8.13;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./library/AllowablesList.sol";
import "./library/WinnableProposalsList.sol";

/*
@todo defined interface
*/
contract Voting is Ownable, AllowablesList, WinnableProposalsList {

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

    WorkflowStatus private _state;

    event VoterRegistered (address voterAddress);
    event WorkflowStatusChange (WorkflowStatus previousStatus, WorkflowStatus newStatus);
    event ProposalRegistered (uint proposalId);
    event Voted (address voter, uint proposalId);
    event ProposalWinning (Proposal);
    event NoProposalWinning ();

    event Received(address, uint);
    event Fallbacked(address, uint);

    modifier onlyStatus (WorkflowStatus state_) {
        require (_state == state_, "Internal state not allowed");
        _;
    }

    modifier onlyOnStatus (WorkflowStatus stateA, WorkflowStatus stateB) {
        require (_state == stateA || _state == stateB, "Internal state not allowed");
        _;
    }

    function init () external {
        _init();
    }

    function _init () onlyStatus(WorkflowStatus.Undefined) internal {
        _setAllowedListManager(msg.sender);
        _resetAllowedList();
        _updateWorkflowState(WorkflowStatus.Initialized);
    }

    function attachVoter (address voter)
    onlyStatus(WorkflowStatus.Initialized)
    external
    {
        _allowed(voter);
    }
    function detachVoter (address voter) external {
        _unauthorized(voter);
    }

    function startProposalsRegistration ()
    onlyOwner
    external
    {
        _updateWorkflowState(WorkflowStatus.ProposalsRegistrationStarted);
    }

    function endProposalsRegistration ()
    onlyOwner
    onlyStatus(WorkflowStatus.ProposalsRegistrationStarted)
    external
    {
        _updateWorkflowState(WorkflowStatus.ProposalsRegistrationEnded);
    }

    function startVotingSession ()
    onlyOwner
    onlyStatus(WorkflowStatus.ProposalsRegistrationEnded)
    external
    {
        _updateWorkflowState(WorkflowStatus.VotingSessionStarted);
    }

    function endVotingSession ()
    onlyOwner
    onlyStatus(WorkflowStatus.VotingSessionStarted)
    external
    {
        _updateWorkflowState(WorkflowStatus.VotingSessionEnded);
        // @todo
    }

    function submitProposal (string memory title, string memory description)
    onlyStatus(WorkflowStatus.ProposalsRegistrationStarted)
    onlyAllowed
    external
    {
        uint proposalId = _createProposal(title, description, msg.sender);
        emit ProposalRegistered(proposalId);
    }

    function submitVote (uint proposalId)
    onlyStatus(WorkflowStatus.VotingSessionStarted)
    onlyAllowed
    override external
    {
        _submitVote(msg.sender, proposalId);
        emit Voted(msg.sender, proposalId);
    }

    function votesCounting ()
    onlyOwner
    onlyStatus(WorkflowStatus.VotingSessionEnded)
    external
    {
        // process counting:
        // generate event on winner found
        // otherwise generate special event for no winner found
        if ( _processCounting() ) {
            emit ProposalWinning (_getWinner());
        }
        else {
            emit NoProposalWinning ();
        }

        _updateWorkflowState(WorkflowStatus.VotesTallied);
    }

    // add given user into the whitelist
    function registerVoter (address addr) onlyOwner external {
        _allowed(addr);
        emit VoterRegistered(addr);
    }

    function reset() onlyOwner external {
        _updateWorkflowState(WorkflowStatus.Undefined);
        _init();
    }

    receive() external payable {
        emit Received(msg.sender, msg.value);
    }
    fallback() external payable {
        emit Fallbacked(msg.sender, msg.value);
    }



    function _updateWorkflowState(WorkflowStatus newState) private {
        WorkflowStatus previousStatus = _state;
        _state = newState;
        emit WorkflowStatusChange(previousStatus, newState);
    }

}

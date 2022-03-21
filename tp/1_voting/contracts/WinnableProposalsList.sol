// SPDX-License-Identifier: GPL-3.0

pragma solidity 0.8.13;

import "./Utils.sol";
import "./ProposablesList.sol";
import "./IWinnableProposalsList.sol";

/**
 * Implementation of IWinnableProposalsList interface
 * and inheritance of ProposablesList.
 *
 * This implementation supply mechanism to allow
 * a proposals list winnable.
 *
 * A proposal is marked as winning when vote counter is bigger
 * than vote counters for others proposals.
 */
contract WinnableProposalsList is ProposablesList, IWinnableProposalsList {

    uint private _winningProposalId;
    mapping (address => uint) private _votersList;

    /**
     * Return the winning proposal.
     * External interface for internal _getWinner function.
     */
    function getWinner () view external returns (Proposal memory) {
        return _getWinner();
    }

    /**
     * Return proposal id voted by the given voter.
     * External function with already voted restriction.
     */
    function haveVotedFor(address voter) view external virtual returns (uint) {
        require (_votersList[voter] > 0, "Not yet voted");
        return _votersList[voter];
    }

    /**
     * Process vote counting for all proposals.
     * External interface for internal _processCounting function.
     */
    function processCounting () onlyProposalsListManager external virtual returns (bool) {
        return _processCounting();
    }

    /**
     * Submit a vote for the given proposal id..
     * External interface for internal _submitVote function.
     */
    function submitVote (uint proposalId) virtual external {
        _submitVote(msg.sender, proposalId);
    }

    /**
     * Return the winning proposal.
     * Internal function with process counting
     * for winning proposal restriction.
     */
    function _getWinner () view internal virtual returns (Proposal memory) {
        require (_winningProposalId != 0, "Not yet counted");
        return _list[_winningProposalId];
    }

    /**
     * Process vote counting for all proposals.
     * Proposal is marked as winning when the internal
     * vote counter is bigger than others.
     * Internal function with manager only restriction.
     */
    function _processCounting () onlyProposalsListManager internal virtual returns (bool) {
        uint boundary;
        for (uint i = 1; i <= _listLength; i++) {
            // filter initialized proposals with biggest boundary :)
            // when 2 proposals have the same vote result, we mark
            // the first one as winner!
            if ( _isInitializedProposal(_list[i]) && boundary < _list[i].voteCount ) {
                // set the new boundary and
                // set the winning proposalId
                boundary = _list[i].voteCount;
                _winningProposalId = i;
            }
        }

        return _winningProposalId > 0;
    }

    /**
     * Submit a vote for the given proposal id..
     * Internal function with existed proposal
     * and not yet voted restrictions.
     */
    function _submitVote (address voter, uint proposalId) onlyExistedProposal (proposalId) internal virtual {
        require (_votersList[voter] == 0, "You have Already voted");
        _votersList[voter] = proposalId;
        _addVoteTo(proposalId);
    }
}

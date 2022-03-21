// SPDX-License-Identifier: GPL-3.0

pragma solidity 0.8.13;

import "./Utils.sol";
import "./ProposablesList.sol";

contract WinnableProposalsList is ProposablesList {
    uint private _winningProposalId;
    mapping (address => uint) private _votersList;

    function _getWinner () view internal returns (Proposal memory) {
        require (_winningProposalId != 0, "Not yet counted");
        return _list[_winningProposalId];
    }
    function getWinner () view external returns (Proposal memory) {
        return _getWinner();
    }

    function _processCounting () internal returns (bool) {
        uint boundary;
        for (uint i = 1; i <= _listLength; i++) {
            // filter to proposal not removed with bigger boundary :)
            // when 2 proposals have the same vote result, we mark
            // the first proposal added as winner!
            if ( _isInitializedProposal(_list[i]) && boundary < _list[i].voteCount ) {
                // set the new boundary and
                // set the winning proposalId
                boundary = _list[i].voteCount;
                _winningProposalId = i;
            }
        }

        return _winningProposalId > 0;
    }

    function submitVote (uint proposalId) virtual external {
        _submitVote(msg.sender, proposalId);
    }

    function haveVotedFor(address voter) view external returns (uint) {
        require (_votersList[voter] > 0, "Not yet voted");
        return _votersList[voter];
    }

    function _submitVote (address voter, uint proposalId) onlyExistedProposal (proposalId) internal {
        require (_votersList[voter] == 0, "You have Already voted");
        _votersList[voter] = proposalId;
        _addVoteTo(proposalId);
    }
}

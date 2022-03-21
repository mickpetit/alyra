// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.8.13;

/**
 * Interface to defined proposals list.
 *
 * Define signatures of externals functions
 * to be useful for callers.
 */
interface IProposablesList {

    /**
     * Structure of a proposal.
     */
    struct Proposal {
        string title;
        string description;
        uint voteCount;
        address author;
    }
    function getProposal (uint id) view external returns(Proposal memory);
    function getTotalOfProposables () view external returns (uint);
    function updateProposal (uint id, string memory title, string memory description) external;
    function removeProposal (uint id) external;
}

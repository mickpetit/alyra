// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.8.13;

import "./IProposablesList.sol";

/**
 * Interface to defined winnable proposals list.
 *
 * Define signatures of externals functions
 * to be useful for callers.
 */
interface IWinnableProposalsList is IProposablesList {
    function getWinner () view external returns (Proposal memory);
    function haveVotedFor(address voter) view external returns (uint);
    function submitVote (uint proposalId) external;
    function processCounting () external returns (bool);
}

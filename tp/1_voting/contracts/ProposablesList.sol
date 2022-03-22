// SPDX-License-Identifier: GPL-3.0

pragma solidity 0.8.13;

import "./Utils.sol";
import "./IProposablesList.sol";

/**
 * Implementation of IProposablesList interface
 *
 * This implementation supply mechanism for a public
 * proposables list. A proposal is an  idee
 * exposed to others users.
 *
 * Manage a proposal is only allowed for the author.
 * It's not possible to others users to update
 * or delete others proposals not owned.
 */
contract ProposablesList is IProposablesList {

    /**
     * Private address for manager
     */
    address private _manager;

    /**
     * Mapping of proposals.
     * Internal visibility only.
     */
    mapping (uint => Proposal) internal _list;

    /**
     * Length of proposals mapping.
     * Internal visibility only.
     */
    uint internal _listLength;

    /**
     * Restrict access to manager only.
     */
    modifier onlyProposalsListManager {
        require (msg.sender == _manager, "Restrict to manager only");
        _;
    }

    /**
     * Restrict access to proposal author only.
     */
    modifier onlyAuthor (uint id) {
        require (_list[id].author == msg.sender, "Only author allowed to update his proposals");
        _;
    }

    /**
     * Restrict access for required (not empty) parameter.
     */
    modifier withRequiredParameter (string memory input, string memory parameterName) {
        require (Utils.notEmptyString(input), Utils.stringConcatenation("Parameter required: ", parameterName));
        _;
    }

    /**
     * Restrict access to existing proposal id.
     * Be careful of proposal id, ids can exists
     * but proposal can be removed ;-).
     */
    modifier onlyExistingIndex (uint id) {
        require (id > 0 && id <= _listLength, "Index out of boundaries");
        _;
    }

    /**
     * Restrict access to existed proposal (not removed).
     */
    modifier onlyExistedProposal (uint id) {
        require (_isInitializedProposal(_list[id]), "This proposal was removed");
        _;
    }

    /**
     * Return the proposal associated to the given proposal id.
     * External function with existed proposal restriction.
     */
    function getProposal (uint id) onlyExistingIndex(id) onlyExistedProposal (id) view external virtual returns (Proposal memory) {
        return _list[id];
    }

    /**
     * Return total of proposals not removed.
     * External function without restriction :)
     */
    function getTotalOfProposables () view external virtual returns (uint){
        uint total;
        for (uint i = 0; i <= _listLength; i++) {
            // filter proposals by initialized only
            if ( _isInitializedProposal(_list[i]) ) {
                total++;
            }
        }
        return total;
    }

    /**
     * Update the proposal at the given proposal id.
     * External function with existed proposal, author
     * and not empty parameters restrictions :)
     */
    function updateProposal (uint id, string memory title, string memory description)
        onlyExistingIndex(id)
        onlyAuthor(id)
        withRequiredParameter(title, "title")
        withRequiredParameter(description, "description")
        external virtual
    {
        _list[id] = Proposal(
            title,
            description,
            _list[id].voteCount,
            _list[id].author
        );
    }

    /**
     * Remove the proposal at the given proposal id.
     * External interface for internal _removeProposal function.
     */
    function removeProposal (uint id) external virtual {
        _removeProposal(id);
    }

    /**
     * Increase vote counter to the given proposal id.
     * Internal function with existing restriction :)
     */
    function _addVoteTo (uint id) onlyExistingIndex(id) onlyExistingIndex(id) internal virtual {
        _list[id].voteCount++;
    }

    /**
     * Create a new proposal and insert it into the internal list.
     * Internal function with not empty parameters as title and description.
     * It return the proposal id.
     */
    function _createProposal (string memory title, string memory description, address author)
        withRequiredParameter(title, "title")
        withRequiredParameter(description, "description")
        internal virtual
        returns (uint)
    {
        _list[++_listLength] = Proposal(title, description, 0, author);
        return _listLength;
    }

    /**
     * Remove the proposal at the given proposal id.
     * Internal function with existed proposal
     * and author restrictions :)
     * Initialize the proposal with defaults parameters.
     */
    function _removeProposal (uint id) onlyExistingIndex(id) onlyAuthor(id) internal virtual {
        _list[id] = Proposal("", "", 0, address(0));
    }

    /**
     * Reset whole proposals list with defaults parameters.
     * Internal function with manager restriction :)
     */
    function _resetProposablesList () onlyProposalsListManager virtual internal {
        for (uint i = 1; i <= _listLength; i++) {
            _removeProposal(i);
        }
        _listLength = 0;
    }

    /**
     * Define the manager :)
     * Internal function without restriction access.
     * It's not possible to override this function.
     */
    function _setProposablesListManager (address manager_) internal {
        _manager = manager_;
    }

    /**
     * Return true for not empty proposal.
     * It's a utility function.
     */
    function _isInitializedProposal (Proposal memory proposal) pure internal returns (bool) {
        return proposal.author != address(0);
    }
}

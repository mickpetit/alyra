// SPDX-License-Identifier: GPL-3.0

pragma solidity 0.8.13;

import "./Utils.sol";

contract ProposablesList {

    struct Proposal {
        string title;
        string description;
        uint voteCount;
        address author;
    }

    mapping (uint => Proposal) internal _list;
    uint internal _listLength;

    modifier onlyAuthor (uint id) {
        require (_list[id].author == msg.sender, "Only author allowed to update his proposals");
        _;
    }
    modifier withRequiredParameter (string memory input, string memory parameterName) {
        require (Utils.notEmptyString(input), Utils.stringConcatenation("Parameter required: ", parameterName));
        _;
    }
    modifier onlyExistingIndex (uint id) {
        require (id > 0 && id <= _listLength, "Index out of boundaries");
        _;
    }
    modifier onlyExistedProposal (uint id) {
        require (_isInitializedProposal(_list[id]), "Proposal removed");
        _;
    }

    function _createProposal (string memory title, string memory description, address author)
    withRequiredParameter(title, "title")
    withRequiredParameter(description, "description")
    internal
    returns (uint)
    {
        _list[++_listLength] = Proposal(title, description, 0, author);
        return _listLength;
    }

    function getProposal (uint id) onlyExistingIndex(id) view external returns (Proposal memory) {
        require(_isInitializedProposal(_list[id]), "This proposal was removed");
        return _list[id];
    }

    // can be directly updated
    function updateProposal (uint id, string memory title, string memory description)
    onlyExistingIndex(id)
    onlyAuthor(id)
    withRequiredParameter(title, "title")
    withRequiredParameter(description, "description")
    external
    {
        _list[id] = Proposal(
            title,
            description,
            _list[id].voteCount,
            _list[id].author
        );
    }

    // can be directly removed
    function removeProposal (uint id) onlyExistingIndex(id) external {
        _removeProposal(id);
    }

    function _removeProposal (uint id) onlyExistingIndex(id) onlyAuthor(id) internal {
        _list[id] = Proposal("", "", 0, address(0));
    }

    function _resetProposablesList () virtual internal {
        for (uint i = 1; i <= _listLength; i++) {
            _removeProposal(i);
        }
        _listLength = 0;
    }

    function _addVoteTo (uint id) onlyExistingIndex(id) internal {
        _list[id].voteCount++;
    }

    function getTotalOfProposables () view external returns (uint){
        // count activated proposals only
        uint total;
        for (uint i = 0; i <= _listLength; i++) {
            if ( _isInitializedProposal(_list[i]) ) {
                total++;
            }
        }
        return total;
    }

    function _isInitializedProposal (Proposal memory proposal) pure internal returns (bool) {
        return proposal.author != address(0);
    }
}

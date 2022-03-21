// SPDX-License-Identifier: GPL-3.0

pragma solidity 0.8.13;

/*
@todo defined interface
*/
contract AllowablesList {
    address private _manager;
    mapping (address => bool) private _allowedList;

    modifier onlyAllowedListManager {
        require (msg.sender == _manager, "Restrict to allowed list manager only");
        _;
    }

    modifier onlyAllowed {
        require (_allowedList[msg.sender], "Restrict to allowed users only");
        _;
    }

    modifier onlyUnauthorized {
        require (_allowedList[msg.sender], "Restrict to unauthorized users only");
        _;
    }

    event AddressAllowed (address addr);
    event AddressUnauthorized (address addr);

    function _allowed (address addr) onlyAllowedListManager internal {
        _allowedList[addr] = true;
        emit AddressAllowed(addr);
    }

    function _unauthorized (address addr) onlyAllowedListManager internal {
        _allowedList[addr] = false;
        emit AddressUnauthorized(addr);
    }

    function _setAllowedListManager (address manager_) internal {
        _manager = manager_;
    }

    function _isAllowed (address addr) view internal returns (bool) {
        return _allowedList[addr];
    }

    function _isUnauthorized (address addr) view internal returns (bool) {
        return _allowedList[addr];
    }

    function _resetAllowedList () onlyAllowedListManager internal {
        //delete _allowedList;
        //@todo
    }
}

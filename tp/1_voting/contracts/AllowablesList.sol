// SPDX-License-Identifier: GPL-3.0

pragma solidity 0.8.13;

import "./IAllowablesList.sol";

/**
 * Implementation of IAllowablesList interface
 *
 * This implementation supply mechanism to manage
 * an access list to allow or restrict users access.
 *
 * By default, it's not possible to add or remove
 * users into the access list. You need to defined
 * an administrator to do this operations.
 * Only this admin can manage this access list.
 */
contract AllowablesList is IAllowablesList {
    /**
     * Private address for manager.
     */
    address private _manager;

    /**
     * Mapping of allowed addresses.
     * Internal visibility only.
     */
    mapping (address => bool) private _allowedList;

    /**
     * Restrict access to manager only.
     */
    modifier onlyAllowedListManager {
        require (msg.sender == _manager, "Restrict to allowed list manager only");
        _;
    }

    /**
     * Restrict access to allowed users only.
     */
    modifier onlyAllowed {
        require (_allowedList[msg.sender], "Restrict to allowed users only");
        _;
    }

    /**
     * Restrict access to unauthorized users only.
     */
    modifier onlyUnauthorized {
        require (_allowedList[msg.sender], "Restrict to unauthorized users only");
        _;
    }

    /**
     * Add the address into the access list.
     * Internal function restricted to manager only.
     */
    function _allow (address addr) onlyAllowedListManager virtual internal {
        require (_isUnauthorized(addr), "Already added");
        _allowedList[addr] = true;
        emit AddressAllowed(addr);
    }

    /**
     * Return true when the given address is in allowed list.
     * Internal function without restriction access.
     */
    function _isAllowed (address addr) view virtual internal returns (bool) {
        return _allowedList[addr];
    }

    /**
     * Return true when the given address is not un allowed list.
     * Internal function without restriction access.
     */
    function _isUnauthorized (address addr) view virtual internal returns (bool) {
        return _allowedList[addr] == false;
    }

    /**
     * Define the manager :)
     * Internal function without restriction access.
     * It's not possible to override this function.
     */
    function _setAllowedListManager (address manager_) internal {
        _manager = manager_;
    }

    /**
     * Mark the address as unauthorized
     * Internal function restricted to manager only.
     */
    function _unauthorized (address addr) onlyAllowedListManager virtual internal {
        require (_isAllowed(addr), "Already removed");
        _allowedList[addr] = false;
        emit AddressUnauthorized(addr);
    }



}

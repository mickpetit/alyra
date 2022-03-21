// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.8.13;

/**
 * Interface to defined allowable addresses list.
 *
 * Not use black / grey or white terms to be compliant
 * with new best-practices ;)
 *
 * Define signatures of externals functions
 * to be useful for callers.
 */
interface IAllowablesList {

    event AddressAllowed (address addr);
    event AddressUnauthorized (address addr);

}

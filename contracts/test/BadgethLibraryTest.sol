// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import {BadgethLibrary} from "../BadgethLibrary.sol";

contract BadgethLibraryTest {
  function hashBadge(BadgethLibrary.BadgeMetadata calldata badgeData) public pure returns (bytes32) {
    return BadgethLibrary.hashBadge(badgeData);
  }
}
// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import {BadgethLibrary} from "../BadgethLibrary.sol";

contract BadgethLibraryTest {
  function hashBadge(BadgethLibrary.BadgeMetadata memory badgeData) public pure returns (bytes32) {
    return BadgethLibrary.hashBadge(badgeData);
  }

  function verifyBadge(
    BadgethLibrary.BadgeMetadata calldata badgeData,
    bytes32[] memory merkleProof,
    bytes32 merkleRoot
  ) public pure returns (bool) {
    
    return BadgethLibrary.verify(badgeData, merkleProof, merkleRoot);
  }
}
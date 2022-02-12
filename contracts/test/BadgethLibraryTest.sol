// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import {BadgethLibrary} from "../BadgethLibrary.sol";

contract BadgethLibraryTest {
  function hashBadge(BadgethLibrary.BadgeMetadata memory badgeData) public view returns (bytes32) {
    return BadgethLibrary.hashBadge(badgeData);
  }

  function verifyBadge(
    BadgethLibrary.BadgeMetadata calldata badgeData,
    bytes32[] memory merkleProof,
    uint256[] memory positions,
    bytes32 merkleRoot
  ) public view returns (bool) {
    
    return BadgethLibrary.verify(badgeData, merkleProof, positions, merkleRoot);
  }

  function hashBytes(bytes32[] memory bytesArray) public view returns (bytes32) {
    return keccak256(abi.encodePacked(bytesArray[0], bytesArray[1]));
  }
}
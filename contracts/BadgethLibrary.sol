// SPDX-License-Identifier: MIT

import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

pragma solidity ^0.8.0;

library BadgethLibrary {
  struct BadgeMetadata {
    address winner;
    uint16 badgeId;
    string tokenURI;
  }

  bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
  bytes32 public constant BURNER_ROLE = keccak256("BURNER_ROLE");

  function verify(
    BadgeMetadata calldata badgeData, 
    bytes32[] calldata proof,
    bytes32 merkleRoot
  ) public pure returns (bool) {

    // todo: make hashbadge private and run merkle tests against verify function

    return true;
  }

  function hashBadge(BadgeMetadata calldata badgeData) public pure returns (bytes32) {
    return keccak256(abi.encodePacked(badgeData.winner, badgeData.badgeId, badgeData.tokenURI));
  }
}
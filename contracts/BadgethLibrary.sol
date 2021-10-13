// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

library BadgethLibrary {
  struct BadgeMetadata {
    address winner;
    uint badgeId;
    string tokenURI;
  }

  bytes32 public constant DEFAULT_ADMIN_ROLE = keccak256("DEFAULT_ADMIN_ROLE");
  bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

}
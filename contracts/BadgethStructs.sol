// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

library BadgethStructs {
  struct BadgeMetadata {
    address winner;
    uint badgeId;
    string tokenURI;
  }
}
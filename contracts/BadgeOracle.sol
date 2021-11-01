// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "./Badge.sol";
import {BadgethLibrary} from "./BadgethLibrary.sol";


contract BadgeOracle is AccessControl {

  mapping (address => bytes32) public getMerkleRoot;
  
  constructor() {
    _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
  }

  function updateMerkleRoot(
    address badgeContractAddress,
    bytes32 merkleRoot
  ) public {

    require(hasRole(DEFAULT_ADMIN_ROLE, msg.sender), "Caller is not BadgeOracle admin");
    getMerkleRoot[badgeContractAddress] = merkleRoot;

  }

  function verify(
    BadgethLibrary.BadgeMetadata memory badgeData,
    bytes32[] calldata proof
  ) external {
    // todo: call badgethLibrary to verify
  }
}
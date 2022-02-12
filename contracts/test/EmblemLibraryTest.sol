// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import {EmblemLibrary} from "../EmblemLibrary.sol";

contract EmblemLibraryTest {
  function hashBadge(EmblemLibrary.BadgeStruct memory badgeStruct) public view returns (bytes32) {
    return EmblemLibrary.hashBadge(badgeStruct);
  }

  function verifyBadge(
    EmblemLibrary.BadgeStruct calldata badgeStruct,
    bytes32[] memory merkleProof,
    uint256[] memory positions,
    bytes32 merkleRoot
  ) public view returns (bool) {
    
    return EmblemLibrary.verify(badgeStruct, merkleProof, positions, merkleRoot);
  }

  function hashBytes(bytes32[] memory bytesArray) public view returns (bytes32) {
    return keccak256(abi.encodePacked(bytesArray[0], bytesArray[1]));
  }
}
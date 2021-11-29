// SPDX-License-Identifier: MIT

import "hardhat/console.sol";

pragma solidity ^0.8.0;

library BadgethLibrary {
  struct BadgeMetadata {
    address winner;
    uint16 globalBadgeNumber;
    string badgeDefinitionId;
  }

  bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
  bytes32 public constant BURNER_ROLE = keccak256("BURNER_ROLE");
  bytes32 public constant ORACLE_ROLE = keccak256("ORACLE_ROLE");

  function verify(
    BadgeMetadata memory badgeData,
    bytes32[] memory merkleProof,
    bytes32 merkleRoot
  ) public pure returns (bool) {

    return BadgethMerkleProof.verify(merkleProof, merkleRoot, hashBadge(badgeData));
  }

  function hashBadge(BadgeMetadata memory badgeData) public pure returns (bytes32) {
    return keccak256(abi.encodePacked(badgeData.winner, badgeData.globalBadgeNumber, badgeData.badgeDefinitionId));
  }
}

/**
 * BadgethMerkleProof is identical to OpenZeppelin's MerkleProof library with the 
 * only exception being the replacement of keccak256 with sha256. 
 */ 
library BadgethMerkleProof {
    /**
     * @dev Returns true if a `leaf` can be proved to be a part of a Merkle tree
     * defined by `root`. For this, a `proof` must be provided, containing
     * sibling hashes on the branch from the leaf to the root of the tree. Each
     * pair of leaves and each pair of pre-images are assumed to be sorted.
     */
    function verify(
        bytes32[] memory proof,
        bytes32 root,
        bytes32 leaf
    ) internal pure returns (bool) {
        bytes32 computedHash = leaf;

        for (uint256 i = 0; i < proof.length; i++) {
            bytes32 proofElement = proof[i];

            if (computedHash <= proofElement) {
                // Hash(current computed hash + current element of the proof)
                computedHash = sha256(abi.encodePacked(computedHash, proofElement));
            } else {
                // Hash(current element of the proof + current computed hash)
                computedHash = sha256(abi.encodePacked(proofElement, computedHash));
            }
        }

        // Check if the computed hash (root) is equal to the provided root
        return computedHash == root;
    }
}
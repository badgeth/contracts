// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./lib/badgeth/BadgethStructs.sol";


contract BadgeRegistry {

    event BadgeAdded(string subgraphDeploymentId, int subgraphVersion);
    event BadgeRecipientAdded(address recipient, string subgraphDeploymentId, int subgraphVersion);
    event BadgeMinted(string subgraphDeploymentId, int subgraphVersion);
    event BadgeRecipientDisputed(address recipient, string subgraphDeploymentId, int subgraphVersion);

    address public owner;
    int public minimumBlocksForBadgeMaturity;

    // subgraph -> version -> recipientAddresses -> maturityBlock
    mapping (string => mapping (int => mapping (address => int))) public badgeRecipients;

    constructor(int _minimumBlocksForBadgeMaturity) {
        this.owner = msg.sender;
        this.minimumBlocksForBadgeMaturity = _minimumBlocksForBadgeMaturity;
    }


    function addBadge(string subgraphDeploymentId, int subgraphVersion) public {
        require(msg.sender == owner, "!owner");

        emit event BadgeAdded(subgraphDeploymentId, subgraphVersion));
    }

    // Posts a badge on-chain. Matures after minimum blocks have passed.
    function addBadgeRecipient(address recipient, string subgraphDeploymentId, int subgraphVersion) public {
        require(msg.sender == owner, "!owner");

        this.badgeRecipients[subgraphDeploymentId][subgraphVersion][recipient] = block.number + this.minimumBlocksForClaimClose;
        emit event BadgeRecipientAdded(recipient, subgraphDeploymentId, subgraphVersion);
    }

    // Deletes a claim and emits BadgeRecipientDisputed event.
    function disputeBadgeRecipient(address recipient, string subgraphDeploymentId, int subgraphVersion) public {
        require(msg.sender == owner, "!owner");
        this.badgeRecipients[subgraphDeploymentId][subgraphVersion][recipient] = 0;
        emit event BadgeRecipientDisputed(recipient, subgraphDeploymentId, subgraphVersion);
    }

    // Emits BadgeMinted event badge is ready to mint. 
    // todo: add minting
    function mintBadge(string subgraphDeploymentId, int subgraphVersion) public returns (bool) {
        let maturityBlock = this.badgeClaims[subgraphDeploymentId][subgraphVersion][msg.sender];
        let canMint = (maturityBlock != 0) && (block.number > this.badgeClaims[subgraphDeploymentId][subgraphVersion][msg.sender])
        if (canMint) {
            emit event BadgeMinted(subgraphDeploymentId, subgraphVersion);
        }
        return canMint;
    }
}



// SPDX-License-Identifier: MIT

// BadgeFactory contract deploys BadgeMinter contracts for each badge definition
// BadgeFactory contract deploys a BadgeRecipientOracle contract for validating mint calls to BadgeMinter contracts

pragma solidity ^0.8.0;

import "./BadgeMinter.sol";
import "./BadgeRecipientOracle.sol";
import "./BadgeRecipientCuration.sol";


contract BadgeFactory {

    event BadgeDefinitionCreated(address minterAddress, string gqlQuery, string subgraphName);

    address public governance;
    address public badgeRecipientOracle;
    address public badgeRecipientCuration;

    constructor(address _factoryGovernance) {
        governance = _factoryGovernance;

        badgeRecipientOracle = address(new BadgeRecipientOracle(governance));
        badgeRecipientCuration = address(new BadgeRecipientCuration(badgeRecipientOracle));
        BadgeRecipientOracle(badgeRecipientOracle).addWhitelistedAddress(badgeRecipientCuration);
    }

    function createBadgeDefinition(
        string calldata gqlQuery,
        string calldata subgraphName,
        string calldata badgeName,
        string calldata ipfsURI
        ) public {

        require (msg.sender == governance, "!governance");

        BadgeMinter minterContract = new BadgeMinter(msg.sender, badgeRecipientOracle, badgeName, "", ipfsURI);
        emit BadgeDefinitionCreated(address(minterContract), gqlQuery, subgraphName);
    }

}

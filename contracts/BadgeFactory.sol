// SPDX-License-Identifier: MIT

// BadgeFactory contract deploys BadgeMinter contracts for each badge definition
// BadgeFactory contract deploys a BadgeRecipientOracle contract for validating mint calls to BadgeMinter contracts

pragma solidity ^0.8.0;

import "./BadgeMinter.sol";
import "./BadgeRecipientOracle.sol";
import "./BadgeRecipientCuration.sol";


contract BadgeFactory {

    event BadgeDefinitionCreated(string gqlQuery, string subgraphName);
    event NFTBadgeDefinitionCreated(address minterAddress, string gqlQuery, string subgraphName);

    address public governance;
    address public badgeRecipientOracle;
    address public badgeRecipientCuration; // todo

    constructor(address _factoryGovernance) {
        governance = _factoryGovernance;
    }

    function setBadgeRecipientOracle(address oracleAddress) public {
        require (msg.sender == governance, "!governance");

        badgeRecipientOracle = oracleAddress;
    }

    function setBadgeRecipientCuration(address curationAddress) public {
        require (msg.sender == governance, "!governance");

        badgeRecipientCuration = curationAddress;
    }

    function createBadgeDefinition(
        string calldata gqlQuery,
        string calldata subgraphName,
        string calldata badgeName,
        string calldata ipfsURI
        ) public {

        require (msg.sender == governance, "!governance");

        emit BadgeDefinitionCreated(gqlQuery, subgraphName);
    }

    function createNFTBadgeDefinition(
        string calldata gqlQuery,
        string calldata subgraphName,
        string calldata badgeName,
        string calldata ipfsURI
        ) public {

        require (msg.sender == governance, "!governance");

        BadgeMinter minterContract = new BadgeMinter(msg.sender, badgeRecipientOracle, badgeName, "", ipfsURI);
        emit NFTBadgeDefinitionCreated(address(minterContract), gqlQuery, subgraphName);
    }

}

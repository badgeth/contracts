// BadgeFactory contract deploys BadgeMinter contracts for each badge definition
// BadgeFactory contract deploys a BadgeWinnerOracle contract for validating mint calls to BadgeMinter contracts

pragma solidity ^0.8.0;

import "./BadgeMinter.sol";
import "./BadgeWinnerOracle.sol";


contract BadgeFactory {
    
    event BadgeDefinitionCreated(address minterAddress, string gqlQuery, string subgraphName);
    
    address public governance;
    address public badgeWinnerOracle;
    
    constructor(address _factoryGovernance) {
        governance = _factoryGovernance;
        badgeWinnerOracle = address(new BadgeWinnerOracle(governance));

        // todo: deploy BadgeClaimMiningContract
    }
    
    function createBadgeDefinition(
        string calldata gqlQuery, 
        string calldata subgraphName,
        string calldata badgeName,
        string calldata ipfsURI
        ) public {
            
        require (msg.sender == governance, "!governance");
        
        BadgeMinter minterContract = new BadgeMinter(msg.sender, badgeWinnerOracle, badgeName, "", ipfsURI);
        emit BadgeDefinitionCreated(address(minterContract), gqlQuery, subgraphName);
    }
    
}



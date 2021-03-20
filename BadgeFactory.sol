// BadgeFactory contract deploys BadgeMinter contracts for each badge definition
// BadgeFactory contract deploys a BadgeWinnerOracle contract for validating mint calls to BadgeMinter contracts

pragma solidity ^0.7.2;

import "./BadgeMinter.sol";
import "./BadgeWinnerOracle.sol";


contract BadgeFactory {
    
    event BadgeDefinitionCreated(address minterAddress);
    
    address public governance;
    address public badgeWinnerOracleAddress;
    
    constructor(address _factoryGovernance) public {
        governance = _factoryGovernance;
        BadgeWinnerOracle badgeWinnerOracle = new BadgeWinnerOracle();
        badgeWinnerOracleAddress = address(badgeWinnerOracle);
        
        // todo: deploy BadgeClaimMiningContract
    }
    
    function createBadgeDefinition(
        string calldata gqlQuery, 
        string calldata description, 
        string calldata subgraphName, 
        string calldata subgraphOwner, 
        string calldata protocol, 
        string calldata subgraphVersion
        ) public {
            
        require (msg.sender == governance, "!governance");
        
        BadgeMinter minterContract = new BadgeMinter(msg.sender, description, governance);
        emit BadgeDefinitionCreated(address(minterContract));
    }
    
}



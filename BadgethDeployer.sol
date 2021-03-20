pragma solidity ^0.7.2;

import "./BadgeFactory.sol";

contract BadgethDeployer {
    
    address public governance;
    
    constructor() public {
        governance = msg.sender;
    }
    
    function deployBadgeFactory() public {
        require(msg.sender == governance, "!governance");
        
        new BadgeFactory(governance);
    }
}
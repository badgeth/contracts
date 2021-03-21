pragma solidity ^0.8.0;

import "./BadgeFactory.sol";


contract BadgethDeployer {
    
    address public governance;
    address public badgeFactory;
    
    constructor() {
        governance = msg.sender;
        badgeFactory = deployBadgeFactory();
    }
    
    function deployBadgeFactory() public returns (address) {
        require(msg.sender == governance, "!governance");
        return address(new BadgeFactory(governance));
    }
}
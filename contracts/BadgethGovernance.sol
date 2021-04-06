// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./BadgeFactory.sol";


contract BadgethGovernance {
    
    address public owner;
    
    constructor() {
        owner = msg.sender;
    }

}
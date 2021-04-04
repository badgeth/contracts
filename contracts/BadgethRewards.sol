// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;


// holds ETH deposited by Badgeth Governance contract
// ETH is rewarded to incentivize accounts to call BadgeWinnerOracle's storeBadgeClaims function
// todo: whitelist our secure Ethereum accounts, and the claim mining contract
contract BadgethRewards {
    
    address payable public governance;

    constructor(address payable _governance) {
        governance = _governance;
    }

    function withdrawRewards() public payable {
        require(msg.sender == governance, "!governance");

        governance.transfer(address(this).balance);
    }
    
}
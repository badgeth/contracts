// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./BadgeRecipientOracle.sol";


// holds ETH deposited by Badgeth Governance contract
// ETH is rewarded to incentivize accounts to call storeBadgeClaims
// todo: whitelist our secure Ethereum accounts, and the claim mining contract
contract BadgeRecipientCuration {
    address public badgeRecipientOracle;
    address public whitelistedValidator = 0xfdD336b0d1f58eb4cBc714E10171291d852a9E33;

    constructor(address _badgeRecipientOracleAdresss) {
        badgeRecipientOracle = _badgeRecipientOracleAdresss;
    }

    function requireValidAddress() private view {
        require(whitelistedValidator == msg.sender, "not whitelisted for rewards");
    }

    function storeBadgeClaims(address[] memory claimerAddresses, address badgeAddress) public {
        requireValidAddress();

        BadgeRecipientOracle recipeintOracleContract = BadgeRecipientOracle(badgeRecipientOracle);
        recipeintOracleContract.storeBadgeClaims(claimerAddresses, badgeAddress);
    }

}

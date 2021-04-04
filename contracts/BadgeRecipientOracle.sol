// SPDX-License-Identifier: MIT

// BadgeBridge contract is responsible for storing valid badge redemptions on chain.

pragma solidity ^0.8.0;

import "./BadgeMinter.sol";
import "./lib/badgeth/BadgethStructs.sol";

contract BadgeRecipientOracle {

    // maps BadgeMinter addresses to mappings of (valid claimers -> claim props)
    mapping (address => mapping (address => BadgethStructs.VoucherProps)) public validClaimsMap;
    mapping(address => bool) public whitelistedCurators;

    constructor(address _whitelistedCurator) {
        whitelistedCurators[_whitelistedCurator] = true;
        whitelistedCurators[msg.sender] = true;
    }

    function requireValidAddress() private view {
        require(whitelistedCurators[msg.sender] == true, "!validator");
    }

    function addWhitelistedAddress(address whitelistedAddress) public {
        requireValidAddress();

        whitelistedCurators[whitelistedAddress] = true;
    }

    function storeBadgeClaims(address[] memory claimerAddresses, address badgeAddress) public {
        requireValidAddress();

        for (uint i = 0; i < claimerAddresses.length; i++) {
            BadgethStructs.VoucherProps memory claimProps = BadgethStructs.VoucherProps(true, false);
            validClaimsMap[badgeAddress][claimerAddresses[i]] = claimProps;
        }
    }

    function processClaim(address badgeAddress, address winnerAddress) public {
        BadgethStructs.VoucherProps storage claimProps = validClaimsMap[badgeAddress][winnerAddress];

        require (claimProps.isReadyToMint == true, "!isReadyToMint");

        BadgeMinter minterContract = BadgeMinter(badgeAddress);
        minterContract.awardBadge(winnerAddress);
        claimProps.wasMinted = true;
    }
}

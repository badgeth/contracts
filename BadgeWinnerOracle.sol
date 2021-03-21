// BadgeBridge contract is responsible for storing valid badge redemptions on chain.

pragma solidity ^0.8.0;

import "./BadgeMinter.sol";


contract BadgeWinnerOracle {

    // maps BadgeMinter addresses to mappings of (valid claimers -> claim props)
    mapping (address => mapping (address => BadgeClaimProps)) public validClaimsMap;
    address public validatorAddress;
    
    constructor(address _validatorAddress) {
        validatorAddress = _validatorAddress;
    }

    // todo: refactor using flags for storage efficiency
    struct BadgeClaimProps {
        bool isReadyToMint;
        bool wasMinted;
    }
    
    function storeBadgeClaims(address[] memory claimerAddresses, address badgeAddress) public {
        require(msg.sender == validatorAddress, "!validator");
        
        for (uint i = 0; i < claimerAddresses.length; i++) {
            BadgeClaimProps memory claimProps = BadgeClaimProps(true, false);
            validClaimsMap[badgeAddress][claimerAddresses[i]] = claimProps;
        }
    }
    
    function processClaim(address badgeAddress, address winnerAddress) public {
        BadgeClaimProps storage claimProps = validClaimsMap[badgeAddress][winnerAddress];
        
        require (claimProps.isReadyToMint == true, "!isReadyToMint");
        
        BadgeMinter minterContract = BadgeMinter(badgeAddress);
        minterContract.awardBadge(winnerAddress);
        claimProps.wasMinted = true;
    }
}
// BadgeBridge contract is responsible for storing valid badge redemptions on chain.

pragma solidity ^0.7.2;

import "./BadgeFactory.sol";


contract BadgeWinnerOracle {

    // maps Badge minter addresses to mappings of (BadgeMinter contracts -> valid claimers
    mapping (address => mapping (address => BadgeClaimProps)) public validClaimsMap;
    address public badgeFactoryAddress;
    
    constructor() public {
        // todo: only allow deployment from BadgeFactory contracts
        badgeFactoryAddress = msg.sender;
    }

    // any unique properties worth storing for this individual NFT
    // todo: refactor using flags for storage efficiency
    struct BadgeClaimProps {
        bool expires;           // some claims might have a deadline for minting
        bool isFinalized;       // work-around for Solidity mappings initializing values to 0.
    }
    
    // todo: only allow governance to call storeBadgeClaims
    function storeBadgeClaims(address[] memory claimerAddresses, address badgeAddress) public {
        for (uint i = 0; i < claimerAddresses.length; i++) {
            BadgeClaimProps memory claimProps = BadgeClaimProps(false, true);
            claimProps.isFinalized = true;
            validClaimsMap[badgeAddress][claimerAddresses[i]] = claimProps;
        }
    }
    
    // called from badge minting contracts
    function isClaimValid(address badgeWinnerAddress) public returns (bool) {
        BadgeClaimProps memory props = validClaimsMap[msg.sender][badgeWinnerAddress];
        return props.isFinalized;
    }
}
pragma solidity ^0.7.2;

// holds ETH deposited by Badgeth Governance contract
// ETH is rewarded to incentivize accounts to call storeBadgeClaims
// todo: whitelist our secure Ethereum accounts, and the claim mining contract
contract BadgeRewards {
    
    function storeBadgeClaims(address[] memory claimerAddresses, address badgeAddress) public {
        // todo: whitelist our secure Ethereum accounts, and the claim mining contract
        
        for (uint i = 0; i < claimerAddresses.length; i++) {
            BadgeClaimProps memory claimProps = BadgeClaimProps(false, true);
            claimProps.isSet = true;
            validClaimsMap[badgeAddress][claimerAddresses[i]] = claimProps;
        }
    }
    
}
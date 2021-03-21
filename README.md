# BadgethContracts

## Control Flow
1. Deploy BadgethDeployer
2. Call BadgethDeployer's badgeFactory function to get the address of the deployed BadgeFactory contract
3. Call BadgeFactory's createBadgeDefinition function. This deploys a BadgeMinter contract and emits an event with the contrat's address
4. Call BadgeFactory's badgeWinnerOracle function to get the address of the deployed BadgeWinnerOracle contract
5. Call BadgeWinnerOracle's storeBadgeClaims function.
6. Call BadgeWinnerOracle's processBadgeClaims function and check to make sure an nft was minted for the winner.

// BadgeFactory contract deploys BadgeMinter contracts for each badge definition
// BadgeFactory contract deploys a VoucherOracle contract for validating mint calls to BadgeMinter contracts

pragma solidity ^0.8.0;

import "./BadgeMinter.sol";
import "./VoucherOracle.sol";
import "./VoucherCuration.sol";


contract BadgeFactory {

    event BadgeDefinitionCreated(address minterAddress, string gqlQuery, string subgraphName);

    address public governance;
    address public voucherOracle;
    address public voucherCuration;

    constructor(address _factoryGovernance) {
        governance = _factoryGovernance;
        voucherOracle = address(new VoucherOracle(governance));
        voucherCuration = address(new VoucherCuration(VoucherOracle));
        voucherOracle.addWhitelistedAddress(VoucherCuration);
        // todo: deploy BadgeClaimMiningContract
    }

    function createBadgeDefinition(
        string calldata gqlQuery,
        string calldata subgraphName,
        string calldata badgeName,
        string calldata ipfsURI
        ) public {

        require (msg.sender == governance, "!governance");

        BadgeMinter minterContract = new BadgeMinter(msg.sender, VoucherOracle, badgeName, "", ipfsURI);
        emit BadgeDefinitionCreated(address(minterContract), gqlQuery, subgraphName);
    }

}

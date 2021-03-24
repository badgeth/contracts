// BadgeFactory contract deploys BadgeMinter contracts for each badge definition
// BadgeFactory contract deploys a VoucherOracle contract for validating mint calls to BadgeMinter contracts

pragma solidity ^0.8.0;

import "./BadgeMinter.sol";
import "./VoucherOracle.sol";
import "./VoucherCuration.sol";


contract BadgeFactory {

    event BadgeDefinitionCreated(address minterAddress, string gqlQuery, string subgraphName);

    address public governance;
    address public VoucherOracle;
    address public VoucherCuration;

    constructor(address _factoryGovernance) {
        governance = _factoryGovernance;
        VoucherOracle = address(new VoucherOracle(governance));
        VoucherCuration = address(new VoucherCuration(VoucherOracle));
        VoucherOracle.addWhitelistedAddress(VoucherCuration);
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

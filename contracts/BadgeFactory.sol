// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "./Badge.sol";
import {BadgethLibrary} from "./BadgethLibrary.sol";


contract BadgeFactory is AccessControl {

    // subgraphId => mapping(badgeName => erc721 address)
    mapping (string => mapping (string => address)) public getBadge;
    address[] public allBadges;

    constructor() {
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    function deployBadgeContract(
        string memory subgraphId,
        string memory badgeName,
        string memory symbol
        // address oracle
    ) public {

        require(getBadge[subgraphId][badgeName] == address(0), "Badge already exists");

        // Badge badge = new Badge(subgraphId, badgeName, symbol, oracle);
        Badge badge = new Badge(subgraphId, badgeName, symbol);
        getBadge[subgraphId][badgeName] = address(badge);
        allBadges.push(address(badge));
    }

    function awardBadge(
        string memory subgraphId,
        string memory badgeName,
        BadgethLibrary.BadgeMetadata memory badgeData
    ) public {

        require(getBadge[subgraphId][badgeName] != address(0), "Badge doesn't exist");
        
        Badge badge = Badge(getBadge[subgraphId][badgeName]);
        badge.awardBadge(badgeData);
    }

    function transferBadgeAdminRole(
        string memory subgraphId,
        string memory badgeName,
        address admin
    ) public {
        
        require(hasRole(DEFAULT_ADMIN_ROLE, msg.sender), "Caller is not BadgeFactory admin");

        Badge badge = Badge(getBadge[subgraphId][badgeName]);
        badge.grantRole(DEFAULT_ADMIN_ROLE, admin);
        badge.revokeRole(DEFAULT_ADMIN_ROLE, address(this));
    }
}
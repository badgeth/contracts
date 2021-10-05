// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./Badge.sol";
import {BadgethStructs} from "./BadgethStructs.sol";

// research if it would be more gas efficient to check whitelisted addresses in Badge.sol

contract BadgeFactory is Ownable {

    // subgraphId => mapping(badgeName => erc721 address)
    mapping (string => mapping (string => address)) public getBadge;
    address[] public allBadges;

    function deployBadgeContract(
        string memory subgraphId,
        string memory badgeName,
        string memory symbol
    ) public onlyOwner {

        require(getBadge[subgraphId][badgeName] == address(0), "Badge already exists");

        Badge badge = new Badge(subgraphId, badgeName, symbol);
        getBadge[subgraphId][badgeName] = address(badge);
        allBadges.push(address(badge));
    }

    function awardBadge(
        string memory subgraphId,
        string memory badgeName,
        BadgethStructs.BadgeMetadata memory badgeData
    ) public onlyOwner {

        require(getBadge[subgraphId][badgeName] != address(0), "Badge doesn't exist");
        Badge badge = Badge(getBadge[subgraphId][badgeName]);
        badge.awardBadge(badgeData);
    }
}
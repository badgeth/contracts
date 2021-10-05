// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {BadgethStructs} from "./BadgethStructs.sol";


contract Badge is ERC721, Ownable {

    using Strings for uint256;

    // subgraphId-badgeName
    string public badgeDefinitionId;
    mapping (uint256 => string) private _tokenURIs;

    constructor(
        string memory subgraphId_,
        string memory name_,
        string memory symbol_
    ) ERC721(name_, symbol_) {

        badgeDefinitionId = string(abi.encodePacked(subgraphId_, name_));
    }

    function awardBadge(BadgethStructs.BadgeMetadata memory badge) public onlyOwner {
        _tokenURIs[badge.badgeId] = badge.tokenURI;
        _mint(badge.winner, badge.badgeId);
    }

    function awardBadges(BadgethStructs.BadgeMetadata[] memory badges) public onlyOwner {
        for (uint i=0; i<badges.length; i++) {
            awardBadge(badges[i]);
        }
    }

    function supportsInterface(bytes4 interfaceId) public view virtual override(ERC721) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
        require(_exists(tokenId), "ERC721Metadata: URI query for nonexistent token");
        return _tokenURIs[tokenId];
    }
}
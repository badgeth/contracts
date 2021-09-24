// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";


contract Badge is ERC721, Ownable {

    using Strings for uint256;

    struct BadgeMetadata {
        address winner;
        uint badgeId;
    }

    // subgraphId-badgeName
    string public badgeDefinitionId;

    constructor(
        string memory subgraphId_,
        string memory name_,
        string memory symbol_
    ) ERC721(name_, symbol_) {

        badgeDefinitionId = string(abi.encodePacked(subgraphId_, name_));
    }

    function awardBadge(
        uint256 badgeNumber,
        address winnerAddress
    ) public onlyOwner {
        _mint(winnerAddress, badgeNumber);
    }

    function awardBadges(BadgeMetadata[] memory badges) public onlyOwner {
        for (uint i=0; i<badges.length; i++) {
            awardBadge(badges[i].badgeId, badges[i].winner);
        }
    }

    function supportsInterface(bytes4 interfaceId) public view virtual override(ERC721) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
        require(_exists(tokenId), "ERC721Metadata: URI query for nonexistent token");
        return string(abi.encodePacked(badgeDefinitionId, tokenId.toString()));
    }
}
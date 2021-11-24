// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {BadgethLibrary} from "./BadgethLibrary.sol";


contract Badge is ERC721, AccessControl {

    using Strings for uint256;

    // subgraphId-badgeName
    string public badgeDefinitionId;
    mapping (uint256 => string) private _tokenURIs;
    bytes32 private _merkleRoot;

    constructor(
        string memory subgraphId_,
        string memory name_,
        string memory symbol_
    ) ERC721(name_, symbol_) {

        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        badgeDefinitionId = string(abi.encodePacked(subgraphId_, name_));
    }


    ////// AWARD BADGES //////

    function awardBadge(BadgethLibrary.BadgeMetadata memory badge) public {
        // todo: verify badge with BadgethLibrary.verify()
        _awardBadge(badge);
    }

    function awardBadges(BadgethLibrary.BadgeMetadata[] memory badges) public {
        for (uint i=0; i<badges.length; i++) {
            _awardBadge(badges[i]);
        }
    }

    function _awardBadge(BadgethLibrary.BadgeMetadata memory badge) private {
        _mint(badge.winner, badge.badgeId);
        _tokenURIs[badge.badgeId] = badge.badgeDefinitionId;
    }

    ////// BURN BADGES //////

    function burnBadge(uint256 badgeId) public {
        require(hasRole(BadgethLibrary.BURNER_ROLE, msg.sender), "Caller is not a burner");
        _burnBadge(badgeId);
    }

    function burnBadges(uint[] memory badgeIDs) public {
        require(hasRole(BadgethLibrary.BURNER_ROLE, msg.sender), "Caller is not a burner");
        
        for (uint i=0; i<badgeIDs.length; i++) {
            _burnBadge(badgeIDs[i]);
        }
    }

    function _burnBadge(uint256 badgeId) private {
        _burn(badgeId);
        _tokenURIs[badgeId] = "";
    }

    ////// Merkle //////

    function updateMerkleRoot(bytes32 root) public {
        require(hasRole(BadgethLibrary.ORACLE_ROLE, msg.sender), "Caller is not an oracle");
        _merkleRoot = root;
    }

    function getMerkleRoot() public view returns (bytes32) {
        return _merkleRoot;
    }


    function supportsInterface(bytes4 interfaceId) public view virtual override(ERC721, AccessControl) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
        require(_exists(tokenId), "ERC721Metadata: URI query for nonexistent token");
        return _tokenURIs[tokenId];
    }
}
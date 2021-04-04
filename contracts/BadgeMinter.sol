// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "openzeppelin-solidity/contracts/utils/Counters.sol";
import "openzeppelin-solidity/contracts/token/ERC721/ERC721.sol";
import "openzeppelin-solidity/contracts/access/Ownable.sol";

import "./BadgeRecipientOracle.sol";

contract BadgeMinter is ERC721 {

    using Counters for Counters.Counter;
    Counters.Counter private _badgeIds;

    address public badgeAuthor;
    address public badgeRecipientOracle;
    string private ipfsURI;

    constructor(
        address _badgeAuthor,
        address _badgeRecipientOracle,
        string memory _name,
        string memory _symbol,
        string memory _ipfsURI
        ) ERC721(_name, _symbol)
    {
        badgeAuthor = _badgeAuthor;
        badgeRecipientOracle = _badgeRecipientOracle;
        ipfsURI = _ipfsURI;
    }

    function baseTokenURI() public view returns (string memory) {
        return ipfsURI;
    }

    function awardBadge(address winnerAddress) public {
        require(msg.sender == badgeRecipientOracle, "not whitelisted to mint badges");

        _badgeIds.increment();
        uint256 newBadgeId = _badgeIds.current();
        _mint(winnerAddress, newBadgeId);
    }
}

pragma solidity ^0.8.0;

import "./lib/openzeppelin/utils/Counters.sol";
import "./lib/openzeppelin/token/ERC721/ERC721.sol";
import "./lib/openzeppelin/access/Ownable.sol";

import "./BadgeWinnerOracle.sol";

contract BadgeMinter is ERC721 {
    
    using Counters for Counters.Counter;
    Counters.Counter private _badgeIds;

    address public badgeAuthor;
    address public badgeWinnerOracle;
    string private ipfsURI;

    constructor(
        address _badgeAuthor, 
        address _badgeWinnerOracle,
        string memory _name,
        string memory _symbol,
        string memory _ipfsURI
        ) ERC721(_name, _symbol)
    {
        badgeAuthor = _badgeAuthor;
        badgeWinnerOracle = _badgeWinnerOracle;
        ipfsURI = _ipfsURI;
    }
    
    function baseTokenURI() public view returns (string memory) {
        return ipfsURI;
    }
    
    function awardBadge(address winnerAddress) public {
        require(msg.sender == badgeWinnerOracle, "not whitelisted to mint badges");
        
        _badgeIds.increment();
        uint256 newBadgeId = _badgeIds.current();
        _mint(winnerAddress, newBadgeId);
    }
}
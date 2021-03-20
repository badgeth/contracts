pragma solidity ^0.7.2;

contract BadgeMinter {
    
    event BadgeMinted(address indexed badgeWinner);
    
    string public gqlQuery;
    address public badgeAuthor;
    string public badgeDescription;
    
    address public badgeWinnerOracle;
    
    constructor(
        address _badgeAuthor, 
        string memory _badgeDescription,
        address _badgeWinnerOracle
        ) public 
    {
        badgeAuthor = _badgeAuthor;
        badgeDescription = _badgeDescription;
        badgeWinnerOracle = _badgeWinnerOracle;
    }
    
    function mintForAddress(address badgeWinner) public {
        // todo: check with badgeWinnerOracle first
        // todo: actually mint an nft to the badgeWinner
        
        emit BadgeMinted(badgeWinner);
    }
}
// SPDX-License-Identifier: Unlicense
pragma solidity ^0.6.0;

import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "./CloneFactory.sol";
import "./DuFundToken.sol";

contract DuFund is ERC721, CloneFactory {
    using SafeMath for uint256;

    struct CF {
        uint256 target;
        uint256 expiryDate;
        uint256 gweiPerToken;
        bool isCancelled;
    }

    uint256 nextTokenID;
    address deployedDuFundToken;

    mapping(uint256 => CF) tokenIDtoCF;
    mapping(uint256 => uint256) tokenIDtoBalance;
    mapping(uint256 => address) tokenIDtoDeployedAddress;

    constructor(address deployedDuFundToken_) public ERC721('DuFund NFT','DFN'){
        nextTokenID = 1;
        deployedDuFundToken = deployedDuFundToken_;
    }

    // ------------------------------------------------------------
    // Core public functions
    // ------------------------------------------------------------
    function createCF(string memory CID, uint256 target_, uint256 expiryDate_, uint256 gweiPerToken_) public {
        _safeMint(msg.sender, nextTokenID);
        _setTokenURI(nextTokenID, CID);
        CF memory cf = CF(
            target_,
            expiryDate_,
            gweiPerToken_,
            false
        );
        tokenIDtoCF[nextTokenID] = cf;
        address tokenAddress = createClone(deployedDuFundToken);
        tokenIDtoDeployedAddress[nextTokenID] = tokenAddress;
        DuFundToken tokenInstance = DuFundToken(tokenAddress);
        tokenInstance.init(address(this));
        increaseTokenID();
    }

    function donate(uint256 tokenID) external payable{
        require(_exists(tokenID), 'token does not exists');
        CF memory cf = tokenIDtoCF[tokenID];
        require(!cf.isCancelled, 'CF is cancelled');
        require(!(cf.expiryDate < now && cf.target > tokenIDtoBalance[tokenID]) , 'CF is expired');
        
        tokenIDtoBalance[tokenID] = tokenIDtoBalance[tokenID].add(msg.value);
        uint256 tokenAmount = msg.value.div(cf.gweiPerToken);
        DuFundToken tokenInstance = DuFundToken(tokenIDtoDeployedAddress[tokenID]);
        tokenInstance.mint(msg.sender, tokenAmount);
    }
    
    // ------------------------------------------------------------
    // View functions
    // ------------------------------------------------------------
    function getTokenID() public view returns (uint256) {
        return nextTokenID;
    }

    function getInstanceAddress(uint256 tokenID) public view returns (address) {
        return tokenIDtoDeployedAddress[tokenID];
    }

     function getCF(uint256 tokenID) public view returns (uint256 target, uint256 expiryDate, uint gweiPerToken, bool isCancelled) {
        CF memory cf = tokenIDtoCF[tokenID];
        require(cf.expiryDate != 0, 'cannot find CF');
        return (cf.target, cf.expiryDate, cf.gweiPerToken, cf.isCancelled); 
    }

    function getBalance(uint256 tokenID) public view returns (uint256 balance){
        return tokenIDtoBalance[tokenID];
    }

    function getTokenAmount(uint256 tokenID) public view returns (uint256 amount){
        require(_exists(tokenID), 'token does not exists');

        DuFundToken tokenInstance = DuFundToken(tokenIDtoDeployedAddress[tokenID]);
        return tokenInstance.balanceOf(msg.sender);
    }

    // ------------------------------------------------------------
    // Private functions
    // ------------------------------------------------------------
    function increaseTokenID() private {
        nextTokenID = nextTokenID.add(1);
    }
}

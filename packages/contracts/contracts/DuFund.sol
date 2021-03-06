// SPDX-License-Identifier: Unlicense
pragma solidity ^0.6.0;

import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./CloneFactory.sol";
import "./DuFundToken.sol";

contract DuFund is ERC721, CloneFactory, ReentrancyGuard {
    using SafeMath for uint256;

    struct CF {
        address creator;
        uint256 target;
        uint256 expiryDate;
        uint256 weiPerToken;
        bool isCancelled;
        bool isClosed;
    }

    uint256 nextTokenID;
    address deployedDuFundToken;

    mapping(uint256 => CF) tokenIDtoCF;
    mapping(uint256 => uint256) tokenIDtoBalance;
    mapping(uint256 => address) tokenIDtoDeployedAddress;
    mapping(uint256 => mapping(address => uint256)) tokenIDtoInvestorDonation;

    constructor(address deployedDuFundToken_)
        public
        ERC721("DuFund NFT", "DFN")
        ReentrancyGuard()
    {
        nextTokenID = 1;
        deployedDuFundToken = deployedDuFundToken_;
    }

    // ------------------------------------------------------------
    // Core public functions
    // ------------------------------------------------------------
    function createCF(
        uint256 tokenID,
        string memory CID,
        uint256 target_,
        uint256 expiryDate_,
        uint256 weiPerToken_
    ) external {
        // mint ERC721 token
        _safeMint(msg.sender, tokenID);

        // set token URI
        _setTokenURI(tokenID, CID);

        // create struct for mappings
        CF memory cf =
            CF(msg.sender, target_, expiryDate_, weiPerToken_, false, false);
        tokenIDtoCF[tokenID] = cf;
        address tokenAddress = createClone(deployedDuFundToken);
        tokenIDtoDeployedAddress[tokenID] = tokenAddress;

        // instanciate a DuFundToken
        DuFundToken tokenInstance = DuFundToken(tokenAddress);
        tokenInstance.init();

        // go to the next ID
        increaseTokenID();
    }

    function donate(uint256 tokenID) external payable {
        require(_exists(tokenID), "token does not exists");
        CF memory cf = tokenIDtoCF[tokenID];
        require(!(cf.isCancelled || cf.isClosed), "CF is cancelled or closed");
        require(
            !(cf.expiryDate < now && cf.target > tokenIDtoBalance[tokenID]),
            "CF is expired"
        );

        tokenIDtoBalance[tokenID] = tokenIDtoBalance[tokenID].add(msg.value);
        tokenIDtoInvestorDonation[tokenID][msg.sender] = msg.value;
        uint256 tokenAmount = msg.value.div(cf.weiPerToken);
        DuFundToken tokenInstance =
            DuFundToken(tokenIDtoDeployedAddress[tokenID]);
        tokenInstance.mint(msg.sender, tokenAmount);
    }

    function withdrawDonatorPayments(address payable recipient, uint256 tokenID)
        external
        nonReentrant
    {
        require(_exists(tokenID), "token does not exists");
        require(recipient == msg.sender, "not the same as sender");
        CF memory cf = tokenIDtoCF[tokenID];
        require(!cf.isClosed, "CF is closed");
        require(
            cf.expiryDate < now && cf.target > tokenIDtoBalance[tokenID],
            "CF is still going"
        );

        uint256 moneyAmount = tokenIDtoInvestorDonation[tokenID][recipient];
        // clear mappings
        tokenIDtoBalance[tokenID] = tokenIDtoBalance[tokenID] - moneyAmount;
        tokenIDtoInvestorDonation[tokenID][msg.sender] = 0;
        // burn ERC20 token
        DuFundToken tokenInstance =
            DuFundToken(tokenIDtoDeployedAddress[tokenID]);
        uint256 tokenAmount = tokenInstance.balanceOf(msg.sender);
        tokenInstance.burn(msg.sender, tokenAmount);
        // send back the money
        (bool success, ) = recipient.call{value: moneyAmount}("");
        require(
            success,
            "Address: unable to send value, recipient may have reverted"
        );
    }

    function withdrawCreatorPayments(address payable recipient, uint256 tokenID)
        external
        nonReentrant
    {
        CF memory cf = tokenIDtoCF[tokenID];
        require(cf.isClosed, "CF is not closed");
        require(cf.creator == msg.sender, "only creator can execute");
        require(recipient == msg.sender, "only creator can execute");

        (bool success, ) = recipient.call{value: tokenIDtoBalance[tokenID]}("");
        require(
            success,
            "Address: unable to send value, recipient may have reverted"
        );
    }

    function cancelCF(uint256 tokenID) public {
        CF memory cf = tokenIDtoCF[tokenID];
        require(cf.creator == msg.sender, "only creator can execute");
        cf.isCancelled = true;
        tokenIDtoCF[tokenID] = cf;
    }

    function closeCF(uint256 tokenID) public {
        CF memory cf = tokenIDtoCF[tokenID];
        require(cf.creator == msg.sender, "only creator can execute");
        require(cf.target < tokenIDtoBalance[tokenID], "target is not reached");

        cf.isClosed = true;
        tokenIDtoCF[tokenID] = cf;
    }
    // ------------------------------------------------------------
    // Public View functions
    // ------------------------------------------------------------
    function getCF(uint256 tokenID)
        public
        view
        returns (
            address creator,
            uint256 target,
            uint256 expiryDate,
            uint256 weiPerToken,
            bool isCancelled,
            bool isClosed
        )
    {
        CF memory cf = tokenIDtoCF[tokenID];
        require(cf.expiryDate != 0, "cannot find CF");
        return (
            cf.creator,
            cf.target,
            cf.expiryDate,
            cf.weiPerToken,
            cf.isCancelled,
            cf.isClosed
        );
    }

    // ------------------------------------------------------------
    // External View functions
    // ------------------------------------------------------------
    function getTokenID() external view returns (uint256) {
        return nextTokenID;
    }

    function getRaisedMoeny(uint256 tokenID) external view returns (uint256) {
        return tokenIDtoBalance[tokenID];
    }

    function getMyDonation(uint256 tokenID) external view returns (uint256) {
        return tokenIDtoInvestorDonation[tokenID][msg.sender];
    }

    function getInstanceAddress(uint256 tokenID) external view returns (address) {
        return tokenIDtoDeployedAddress[tokenID];
    }

    function getTokenAmount(uint256 tokenID)
        external
        view
        returns (uint256 amount)
    {
        require(_exists(tokenID), "token does not exists");

        DuFundToken tokenInstance =
            DuFundToken(tokenIDtoDeployedAddress[tokenID]);
        return tokenInstance.balanceOf(msg.sender);
    }

    // ------------------------------------------------------------
    // Private functions
    // ------------------------------------------------------------
    function increaseTokenID() private {
        nextTokenID = nextTokenID.add(1);
    }
}

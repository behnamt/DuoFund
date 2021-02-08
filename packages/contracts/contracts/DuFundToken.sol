// SPDX-License-Identifier: Unlicense
pragma solidity ^0.6.0;

import './ERC20.sol';

contract DuFundToken is ERC20 {

    address contractOwner;
    constructor() public ERC20('DuFundToken', 'DFT') {
        _setupDecimals(0);
    }

    // setting storage should be done not in constructor
    function init(address owner_) external {
        contractOwner = owner_;
    }

    // ------------------------------------------------------------
    // Core public functions
    // ------------------------------------------------------------
    function mint(address to, uint256 amount) onlyOwner external {
        _mint(to, amount);
    }

    modifier onlyOwner() {
        require(contractOwner == msg.sender, "Ownable: caller is not the owner");
        _;
    }
}

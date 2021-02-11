// SPDX-License-Identifier: Unlicense
pragma solidity ^0.6.0;

import './ERC20.sol';

contract DuFundToken is ERC20 {

    address contractOwner;
    constructor() public ERC20('DuFundToken', 'DFT') {
        _setupDecimals(0);
    }

    // setting storage should be done not in constructor
    function init() external {
        contractOwner = msg.sender;
    }

    // ------------------------------------------------------------
    // Core public functions
    // ------------------------------------------------------------
    function mint(address to, uint256 amount) onlyOwner external {
        _mint(to, amount);
    }

    function burn(address to, uint256 amount) onlyOwner external {
        _burn(to, amount);
    }

    modifier onlyOwner() {
        require(contractOwner == msg.sender, "Ownable: caller is not the owner");
        _;
    }
}

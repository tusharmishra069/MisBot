// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MisToken is ERC20, Ownable {
    constructor() ERC20("Misbot Token", "MIS") Ownable(msg.sender) {
        _mint(msg.sender, 100_000_000 * 10**18); // 100M initial supply
    }

    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }
}

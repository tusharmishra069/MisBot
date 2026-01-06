// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract MisClaim is Ownable, EIP712 {
    IERC20 public token;
    address public signer;

    mapping(bytes32 => bool) public claimed; // hash(nonce, user) -> claimed status

    constructor(address _token, address _signer) EIP712("Misbot", "1") Ownable(msg.sender) {
        token = IERC20(_token);
        signer = _signer;
    }

    function setSigner(address _signer) external onlyOwner {
        signer = _signer;
    }

    // backend generates signature: sign(user, amount, nonce)
    function claim(uint256 amount, uint256 nonce, bytes calldata signature) external {
        bytes32 structHash = keccak256(abi.encode(
            keccak256("Claim(address user,uint256 amount,uint256 nonce)"),
            msg.sender,
            amount,
            nonce
        ));
        
        bytes32 digest = _hashTypedDataV4(structHash);
        address recoveredSigner = ECDSA.recover(digest, signature);
        
        require(recoveredSigner == signer, "Invalid signature");
        require(!claimed[structHash], "Already claimed");
        
        claimed[structHash] = true;
        require(token.transfer(msg.sender, amount), "Transfer failed");
    }
}

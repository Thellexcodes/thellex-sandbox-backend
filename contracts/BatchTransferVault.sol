// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IERC20 {
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
    function transfer(address recipient, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

contract BatchTransferVault {
    address public owner;

    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
    event BatchTransferExecuted(address indexed token, uint256 totalTransfers);
    event TokenWithdrawn(address indexed token, address indexed to, uint256 amount);

    modifier onlyOwner() {
        require(msg.sender == owner, "BatchTransferVault: caller is not the owner");
        _;
    }

    constructor() {
        owner = msg.sender;
        emit OwnershipTransferred(address(0), msg.sender);
    }

    /// @notice Batch transfer ERC20 tokens from the caller to many recipients
    /// @param token The ERC20 token address
    /// @param recipients The array of recipient addresses
    /// @param amounts The array of amounts to transfer
    function batchTransferERC20(
        address token,
        address[] calldata recipients,
        uint256[] calldata amounts
    ) external onlyOwner {
        require(recipients.length == amounts.length, "BatchTransferVault: recipients and amounts length mismatch");
        require(recipients.length > 0, "BatchTransferVault: empty batch");

        for (uint256 i = 0; i < recipients.length; i++) {
            require(
                IERC20(token).transferFrom(msg.sender, recipients[i], amounts[i]),
                "BatchTransferVault: transferFrom failed"
            );
        }

        emit BatchTransferExecuted(token, recipients.length);
    }

    /// @notice Transfer tokens out of the vault (admin only)
    /// @param token The ERC20 token address
    /// @param to The recipient address
    /// @param amount The amount to transfer
    function transferOut(
        address token,
        address to,
        uint256 amount
    ) external onlyOwner {
        require(to != address(0), "BatchTransferVault: zero address");
        require(amount > 0, "BatchTransferVault: zero amount");

        bool success = IERC20(token).transfer(to, amount);
        require(success, "BatchTransferVault: transfer failed");

        emit TokenWithdrawn(token, to, amount);
    }

    /// @notice Change the contract owner
    function setOwner(address newOwner) external onlyOwner {
        require(newOwner != address(0), "BatchTransferVault: new owner is zero address");
        emit OwnershipTransferred(owner, newOwner);
        owner = newOwner;
    }
}

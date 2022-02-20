// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8;

interface IVDF {
    function N() external view returns (uint256);
    function T() external view returns (uint256);
    function MAX_BLOCK_AGE() external view returns (uint256);
    function isValidProof(bytes32 seed, bytes calldata proofBytes) external returns (bool);
}

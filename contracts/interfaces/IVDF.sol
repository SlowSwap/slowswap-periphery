// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8;

interface IVDF {
    function isValidProof(bytes32 seed, bytes calldata proofBytes) external returns (bool);
}

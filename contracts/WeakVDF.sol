// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8;

import "./interfaces/IVDF.sol";

contract WeakVDF is IVDF {
    uint256 public immutable N;
    uint256 public immutable T;
    uint256 public immutable MAX_BLOCK_AGE;

    constructor(uint256 N_, uint256 T_, uint256 maxBlockAge) {
        N = N_;
        T = T_;
        MAX_BLOCK_AGE = maxBlockAge;
    }

    function isValidProof(bytes32 seed, bytes memory proofBytes)
        public
        view
        returns (bool)
    {
        if (proofBytes.length != 96) {
            return false;
        }
        (uint256 pi, uint256 y, uint256 b) =
            abi.decode(proofBytes, (uint256, uint256, uint256));
        uint256 x = _generateX(seed, b);
        uint256 c = _generateChallenge(x, y);
        return y == mulmod(_expmod(pi, c, N), _expmod(x, _expmod(2, T, c), N), N);
    }

    function _generateX(bytes32 seed, uint256 blockNumber)
        internal
        view
        returns (uint256 x)
    {
        require(blockNumber + MAX_BLOCK_AGE >= block.number, 'INVALID_BLOCK_NUMBER');
        uint256 n = N;
        assembly {
            let p := mload(0x40)
            mstore(p, seed)
            mstore(add(p, 0x20), blockhash(blockNumber))
            // mstore(add(p, 0x40), gasprice()) // Allow on non-EIP1559 networks?
            x := keccak256(p, 0x40)
            x := mod(x, n)
        }
    }

    function _generateChallenge(uint256 x, uint256 y)
        internal
        view
        returns (uint256 c)
    {
        uint256 n = N;
        uint256 t = T;
        assembly {
            let p := mload(0x40)
            mstore(p, x)
            mstore(add(p, 0x20), y)
            mstore(add(p, 0x40), n)
            mstore(add(p, 0x60), t)
            c := or(keccak256(p, 0x80), 1)
        }
    }

    function _expmod(
        uint256 b,
        uint256 e,
        uint256 m
    )
        view
        internal
        returns (uint256 r)
    {
        // Call the precompile.
        assembly {
            let p := mload(0x40)
            mstore(add(p, 0), 32)
            mstore(add(p, 0x20), 32)
            mstore(add(p, 0x40), 32)
            mstore(add(p, 0x60), b)
            mstore(add(p, 0x80), e)
            mstore(add(p, 0xA0), m)
            let s := staticcall(gas(), 0x5, p, 0xC0, 0x0, 0x20)
            if iszero(s) {
                revert(0, 0)
            }
            r := mload(0x0)
        }
    }
}

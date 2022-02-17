// SPDX-License-Identifier: GPL-3.0
pragma solidity ^ 0.8;

import "./interfaces/IVDF.sol";

contract WeakVDF is IVDF {
    uint256 public immutable N;
    uint256 public immutable T;

    constructor(uint256 N_, uint256 T_) {
        N = N_;
        T = T_;
    }

    function isValidProof(bytes32 seed, bytes memory proofBytes)
        public
        view
        returns (bool)
    {
        if (proofBytes.length != 64) {
            return false;
        }
        uint256 pi; // VDF proof
        uint256 y; // VDF solution
        uint256 b; // target block
        assembly {
            let p := add(36, calldataload(36))
            pi := calldataload(p)         // pi
            y := calldataload(add(p, 32)) // y
            b := calldataload(add(p, 64)) // block number
        }
        uint256 x = _generateX(seed, b);
        uint256 c = _generateChallenge(x, y, pi);
        return y == mulmod(_expmod(pi, c, N), _expmod(x, _expmod(2, T, c), N), N);
    }

    function _generateX(bytes32 seed, uint256 blockNumber)
        private
        view
        returns (uint256 x)
    {
        require(blockNumber < block.number, 'INVALID_BLOCK_NUMBER');
        assembly {
            let p := mload(0x40)
            mstore(p, seed)
            mstore(add(p, 0x20), blockhash(blockNumber))
            // mstore(add(p, 0x40), gasprice()) // Allow on non-EIP1559 networks?
            x := keccak256(p, 0x40)
        }
    }

    function _generateChallenge(uint256 x, uint256 y, uint256 pi)
        private
        view
        returns (uint256 c)
    {
        uint256 n = N;
        uint256 t = T;
        assembly {
            let p := mload(0x40)
            mstore(p, x)
            mstore(add(p, 0x20), y)
            mstore(add(p, 0x40), pi)
            mstore(add(p, 0x60), n)
            mstore(add(p, 0x80), t)
            c := or(keccak256(p, 0xA0), 1)
        }
    }

    function _expmod(
        uint256 b,
        uint256 e,
        uint256 m
    )
        view
        public
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

// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8;

import "../WeakVDF.sol";

contract TestWeakVDF is WeakVDF {

    constructor(uint256 n, uint256 t, uint256 maxBlockAge) WeakVDF(n, t, maxBlockAge) {}

    function generateX(bytes32 seed, uint256 blockNumber)
        external
        view
        returns (uint256 x)
    {
        return _generateX(seed, blockNumber);
    }

    function generateChallenge(uint256 x, uint256 y)
        external
        view
        returns (uint256 c)
    {
        return _generateChallenge(x, y);
    }

    function expmod(
        uint256 b,
        uint256 e,
        uint256 m
    )
        external
        view
        returns (uint256 r)
    {
        return _expmod(b, e, m);
    }
}

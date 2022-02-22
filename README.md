# Slowswap Periphery Contracts (forked from Uniswap V2)
### Hello Sloths! 
<br>
<p>ETHDenver was a amazing, and we are very excited to share our work on adding VDFs to AMM swaps. We believe this creates a novel way to stop MEV attacks in a super simple, completely decentralized way.</p>

If you'd like to test out the smart contracts yourself, please use the [hack branch](https://github.com/SlowSwap/slowswap-periphery/pull/1), which contains the feature complete VDF implementation as well as tests. This is **UNAUDITED** and should not yet be deployed onto Mainnet. If you'd like to work with us, please reach out! We want this to be a standard for for any area where MEV attacks can happen.
<br>

[![Actions Status](https://github.com/Uniswap/uniswap-v2-periphery/workflows/CI/badge.svg)](https://github.com/Uniswap/uniswap-v2-periphery/actions)
[![npm](https://img.shields.io/npm/v/@uniswap/v2-periphery?style=flat-square)](https://npmjs.com/package/@uniswap/v2-periphery)

In-depth documentation on Uniswap V2 is available at [uniswap.org](https://uniswap.org/docs).

The built contract artifacts can be browsed via [unpkg.com](https://unpkg.com/browse/@uniswap/v2-periphery@latest/).

# Local Development

The following assumes the use of `node@>=10`.

## Install Dependencies

`yarn`

## Compile Contracts

`yarn compile`

## Run Tests

`yarn test`

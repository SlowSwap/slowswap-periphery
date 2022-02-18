import chai, { expect } from 'chai'
import { Contract } from 'ethers'
import { bigNumberify } from 'ethers/utils';
import { deployContract, solidity, MockProvider } from 'ethereum-waffle'
import { evaluateVdf, generateSeed, generateVdf, generateX, generateChallenge } from '@slowswap/vdf';

import { randomQuantity, randomHash, mineBlock, getTargetBlock } from './shared/utilities'
import { VDF_N, VDF_T, VDF_MAX_BLOCK_AGE } from './shared/fixtures'

import TestWeakVDF from '../build/TestWeakVDF.json';

chai.use(solidity)

describe('WeakVDF', () => {
    const provider = new MockProvider({
        hardfork: 'istanbul',
        mnemonic: 'horn horn horn horn horn horn horn horn horn horn horn horn',
        gasLimit: 9999999,
    });
    const [wallet] = provider.getWallets();
    let weakVdf: Contract;

    before(async () => {
        weakVdf = await deployContract(wallet, TestWeakVDF, [VDF_N, VDF_T, VDF_MAX_BLOCK_AGE]);
        for (let i = 0; i < 10; ++i) {
            await mineBlock(provider, Math.floor(Date.now() / 1e3) + i);
        }
    });

    describe('generateX()', () => {
        it('works', async () => {
            const seed = randomHash();
            const { blockNumber, blockHash } = await getTargetBlock(provider);
            const expected = generateX(VDF_N, seed, blockHash);
            const actual = await weakVdf.generateX(seed, blockNumber);
            expectSameNumber(actual, expected);
        });
        it('fails if too old', async () => {
            const seed = randomHash();
            const { blockNumber } = await getTargetBlock(provider, 6);
            return expect(weakVdf.generateX(seed, blockNumber)).to.revertedWith('INVALID_BLOCK_NUMBER');
        });
    });

    describe('generateChallenge()', () => {
        it('works', async () => {
            const seed = randomHash();
            const { blockHash } = await getTargetBlock(provider);
            const x = generateX(VDF_N, seed, blockHash);
            const y = evaluateVdf(x.toString(10), VDF_N, VDF_T);
            const expected = generateChallenge({
                x,
                y,
                n: VDF_N,
                t: VDF_T,
            });
            const actual = await weakVdf.generateChallenge(x.toString(10), y.toString(10));
            expectSameNumber(actual, expected);
        });
    });

    describe('expmod()', () => {
        it('works', async () => {
            const pi = '10573491918793478232872443730032018713895839766681054735181462842707836775171';
            const c = '74791073374440012948966272821658602093686657895749035935510160203767790612275';
            const expected = '5694661073981532927065860030527716976867903315786059041950574589016365555210';
            const actual = await weakVdf.expmod(pi, c, VDF_N);
            expect(actual.toString()).to.eq(expected);
        });
    });

    describe('isValidProof()', () => {
        it('works', async () => {
            const path = [randomHash(20), randomHash(20)];
            const { blockNumber, blockHash } = await getTargetBlock(provider);
            const knownQtyIn = BigInt(randomQuantity().toString());
            const knownQtyOut = BigInt(randomQuantity().toString());
            const seed = generateSeed(wallet.address, path, knownQtyIn, knownQtyOut);
            const vdf = generateVdf({
                path,
                blockHash,
                blockNumber,
                knownQtyIn,
                knownQtyOut,
                origin: wallet.address,
                n: VDF_N,
                t: VDF_T,
            });
            const actual = await weakVdf.isValidProof(seed, vdf);
            expect(actual).to.be.true;
        });
    });
})

function expectSameNumber(a: any, b: any): void {
    expect(bigNumberify(a.toString())).to.eq(bigNumberify(b.toString()));
}

import crypto from 'crypto';
import {
    Contract,
    utils as ethersUtils,
    providers as ethersProviders,
} from 'ethers'
import { BigNumber, bigNumberify } from 'ethers/utils';

type Web3Provider = ethersProviders.Web3Provider;

export const NULL_ADDRESS = ethersUtils.hexZeroPad('0x', 20);
export const ZERO = bigNumberify(0);
export const MINIMUM_LIQUIDITY = bigNumberify(10).pow(3)
export const MAX_UINT256 = bigNumberify(2).pow(256).sub(1);
const { keccak256, defaultAbiCoder, toUtf8Bytes, solidityPack } = ethersUtils;

const PERMIT_TYPEHASH = keccak256(
  toUtf8Bytes('Permit(address owner,address spender,uint256 value,uint256 nonce,uint256 deadline)')
)

export function expandTo18Decimals(n: number): BigNumber {
  return bigNumberify(n).mul(bigNumberify(10).pow(18))
}

function getDomainSeparator(name: string, tokenAddress: string) {
  return keccak256(
    defaultAbiCoder.encode(
      ['bytes32', 'bytes32', 'bytes32', 'uint256', 'address'],
      [
        keccak256(toUtf8Bytes('EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)')),
        keccak256(toUtf8Bytes(name)),
        keccak256(toUtf8Bytes('1')),
        1,
        tokenAddress
      ]
    )
  )
}

export async function getApprovalDigest(
  token: Contract,
  approve: {
    owner: string
    spender: string
    value: BigNumber
  },
  nonce: BigNumber,
  deadline: BigNumber
): Promise<string> {
  const name = await token.name()
  const DOMAIN_SEPARATOR = getDomainSeparator(name, token.address)
  return keccak256(
    solidityPack(
      ['bytes1', 'bytes1', 'bytes32', 'bytes32'],
      [
        '0x19',
        '0x01',
        DOMAIN_SEPARATOR,
        keccak256(
          defaultAbiCoder.encode(
            ['bytes32', 'address', 'address', 'uint256', 'uint256', 'uint256'],
            [PERMIT_TYPEHASH, approve.owner, approve.spender, approve.value, nonce, deadline]
          )
        )
      ]
    )
  )
}

export async function mineBlock(provider: Web3Provider, timestamp: number): Promise<void> {
    await provider.send(
        'evm_mine',
        [timestamp],
    );
}

export function encodePrice(reserve0: BigNumber, reserve1: BigNumber) {
  return [reserve1.mul(bigNumberify(2).pow(112)).div(reserve0), reserve0.mul(bigNumberify(2).pow(112)).div(reserve1)]
}

export function randomHash(len: number = 32): string {
    return '0x' + crypto.randomBytes(len).toString('hex');
}

export function randomQuantity(decimals: number = 18): BigNumber {
    const n = bigNumberify(10).pow(decimals);
    return bigNumberify('0x' + crypto.randomBytes(32).toString('hex')).mod(n);
}

export async function getTargetBlock(provider: Web3Provider, age: number = 0):
    Promise<{ blockNumber: number; blockHash: string }>
{
    const currentBlockNumber = await provider.getBlockNumber();
    const blockNumber = currentBlockNumber - age - 1;
    const blockHash = (await provider.getBlock(blockNumber)).hash;
    return { blockNumber, blockHash };
}

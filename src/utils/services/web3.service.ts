// modules/services/web3.service.ts

import { SupportedBlockchainType } from '@/config/settings';
import Web3 from 'web3';
import { AbiItem } from 'web3-utils';

const ERC20_ABI: AbiItem[] = [
  {
    constant: true,
    inputs: [{ name: '_owner', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: 'balance', type: 'uint256' }],
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'decimals',
    outputs: [{ name: '', type: 'uint8' }],
    type: 'function',
  },
];

export class Web3Service {
  private rpcMap: Record<SupportedBlockchainType, string> = {
    [SupportedBlockchainType.TRC20]: '',
    [SupportedBlockchainType.BEP20]: `https://base-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API}`,
    [SupportedBlockchainType.MATIC]: `https://polygon-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API}`,
  };

  getWeb3(network: SupportedBlockchainType): Web3 {
    const rpcUrl = this.rpcMap[network];
    if (!rpcUrl) throw new Error(`Unsupported network: ${network}`);
    return new Web3(new Web3.providers.HttpProvider(rpcUrl));
  }

  async getERC20Balance(
    tokenAddress: string,
    userAddress: string,
    network: SupportedBlockchainType,
  ): Promise<number> {
    const web3 = this.getWeb3(network);
    const contract = new web3.eth.Contract(ERC20_ABI, tokenAddress);

    const [rawBalance, decimals] = await Promise.all([
      contract.methods.balanceOf(userAddress).call(),
      contract.methods.decimals().call(),
    ]);

    // Handle 6-decimal tokens like USDC
    // @ts-expect-error:ignore
    const unit = decimals === '6' ? 'mwei' : 'ether';
    // @ts-expect-error:ignore
    const balance = parseFloat(web3.utils.fromWei(rawBalance, unit));

    return balance;
  }
}

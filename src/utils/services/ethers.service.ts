import { ethers, JsonRpcProvider } from 'ethers';
import type { AbiItem } from 'web3-utils';
import { SupportedBlockchainTypeEnum } from '@/config/settings';

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

const DEFAULT_DECIMALS = 18;

const NETWORK_RPC_MAP: Record<Partial<SupportedBlockchainTypeEnum>, string> = {
  [SupportedBlockchainTypeEnum.ETHEREUM]: 'https://rpc.ankr.com/eth',
  [SupportedBlockchainTypeEnum.BEP20]: '',
  [SupportedBlockchainTypeEnum.TRC20]: '',
  [SupportedBlockchainTypeEnum.MATIC]: '',
};

export class EtherService {
  private providers: Map<SupportedBlockchainTypeEnum, JsonRpcProvider>;

  constructor() {
    this.providers = new Map();

    for (const [chain, rpcUrl] of Object.entries(NETWORK_RPC_MAP)) {
      this.providers.set(
        chain as SupportedBlockchainTypeEnum,
        new JsonRpcProvider(rpcUrl),
      );
    }
  }

  getProvider(chain: SupportedBlockchainTypeEnum): JsonRpcProvider {
    const provider = this.providers.get(chain);
    if (!provider) throw new Error(`No provider configured for ${chain}`);
    return provider;
  }

  isValidAddress(address: string): boolean {
    return ethers.isAddress(address);
  }

  normalizeAddress(address: string): string | null {
    return this.isValidAddress(address) ? ethers.getAddress(address) : null;
  }

  async getNativeBalance(
    address: string,
    chain: SupportedBlockchainTypeEnum,
  ): Promise<string> {
    if (!this.isValidAddress(address)) return '0';
    const provider = this.getProvider(chain);
    const balance = await provider.getBalance(address);
    return ethers.formatEther(balance);
  }

  async getTokenBalance(
    tokenAddress: string,
    userAddress: string,
    chain: SupportedBlockchainTypeEnum,
  ): Promise<string> {
    if (!this.isValidAddress(userAddress) || !this.isValidAddress(tokenAddress))
      return '0';

    const provider = this.getProvider(chain);
    const tokenContract = new ethers.Contract(
      tokenAddress,
      ERC20_ABI,
      provider,
    );

    try {
      const [rawBalance, decimals] = await Promise.all([
        tokenContract.balanceOf(userAddress),
        tokenContract.decimals().catch(() => DEFAULT_DECIMALS),
      ]);

      const formatted = Number(ethers.formatUnits(rawBalance, decimals));
      return formatted.toFixed(4);
    } catch (error) {
      console.error(`Error fetching token balance:`, error);
      return '0';
    }
  }

  parseEther(amount: string): bigint {
    return ethers.parseEther(amount);
  }

  formatEther(wei: bigint): string {
    return ethers.formatEther(wei);
  }

  /**
   * Estimate the gas cost for an ERC-20 token transfer
   */
  async estimateTransferFee(params: {
    from: string;
    to: string;
    tokenAddress: string;
    chain: SupportedBlockchainTypeEnum;
  }): Promise<number | any> {
    const { from, to, tokenAddress, chain } = params;
    const provider = this.getProvider(chain);

    const tokenContract = new ethers.Contract(
      tokenAddress,
      ERC20_ABI,
      provider,
    );
    // const gasPrice = await provider.getGasPrice();

    // // Simulate a transfer for estimating gas
    // const estimatedGas = await tokenContract.estimateGas.transfer(to, 1n, {
    //   from,
    // });

    // // Total fee in ETH or MATIC (gasPrice * estimatedGas)
    // const gasFeeInNative = gasPrice * estimatedGas;

    // // Convert to Ether/Matic and return as number
    // const formattedFee = parseFloat(ethers.formatEther(gasFeeInNative));
    // return formattedFee;
  }
}

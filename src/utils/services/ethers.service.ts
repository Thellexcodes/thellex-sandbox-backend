import { ethers, JsonRpcProvider } from 'ethers';
import type { AbiItem } from 'web3-utils';
import { SupportedBlockchainType } from '@/config/settings';

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

const NETWORK_RPC_MAP: Record<Partial<SupportedBlockchainType>, string> = {
  [SupportedBlockchainType.ETHEREUM]: 'https://rpc.ankr.com/eth',
  [SupportedBlockchainType.BEP20]: '',
  [SupportedBlockchainType.TRC20]: '',
  [SupportedBlockchainType.MATIC]: '',
};

export class EtherService {
  private providers: Map<SupportedBlockchainType, JsonRpcProvider>;

  constructor() {
    this.providers = new Map();

    for (const [chain, rpcUrl] of Object.entries(NETWORK_RPC_MAP)) {
      this.providers.set(
        chain as SupportedBlockchainType,
        new JsonRpcProvider(rpcUrl),
      );
    }
  }

  getProvider(chain: SupportedBlockchainType): JsonRpcProvider {
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
    chain: SupportedBlockchainType,
  ): Promise<string> {
    if (!this.isValidAddress(address)) return '0';
    const provider = this.getProvider(chain);
    const balance = await provider.getBalance(address);
    return ethers.formatEther(balance);
  }

  async getTokenBalance(
    tokenAddress: string,
    userAddress: string,
    chain: SupportedBlockchainType,
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
}

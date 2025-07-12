import { ethers, JsonRpcProvider, Wallet } from 'ethers';
import type { AbiItem } from 'web3-utils';
import {
  BlockchainNetworkSettings,
  SupportedBlockchainTypeEnum,
  TokenAddresses,
} from '@/config/settings';

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

export class EtherService {
  private providers: Record<SupportedBlockchainTypeEnum, JsonRpcProvider> =
    {} as any;

  constructor() {
    for (const chain of Object.values(SupportedBlockchainTypeEnum)) {
      const config = BlockchainNetworkSettings[chain];
      if (!config || !config.rpcUrl) continue;
      this.providers[chain] = new JsonRpcProvider(config.rpcUrl);
    }
  }

  getProvider(chain: SupportedBlockchainTypeEnum): JsonRpcProvider {
    const provider = this.providers[chain];
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
      console.error(`Error fetching token balance on ${chain}:`, error);
      return '0';
    }
  }

  parseEther(amount: string): bigint {
    return ethers.parseEther(amount);
  }

  formatEther(wei: bigint): string {
    return ethers.formatEther(wei);
  }

  async transferNative(params: {
    privateKey: string;
    to: string;
    amount: string; // in ETH/MATIC/BNB
    chain: SupportedBlockchainTypeEnum;
  }): Promise<{ txHash: string }> {
    const { privateKey, to, amount, chain } = params;

    if (!this.isValidAddress(to)) {
      throw new Error('Invalid recipient address');
    }

    const provider = this.getProvider(chain);
    const wallet = new Wallet(privateKey, provider);

    const tx = await wallet.sendTransaction({
      to,
      value: ethers.parseEther(amount),
    });

    await tx.wait();
    return { txHash: tx.hash };
  }

  async transferToken(params: {
    to: string;
    amount: string;
    assetCode: string;
    chain: SupportedBlockchainTypeEnum;
  }): Promise<{ txHash: string; sourceAddress: string }> {
    const { to, amount, chain } = params;

    const tokenAddress = TokenAddresses[chain]?.[params.assetCode];
    if (!tokenAddress) {
      throw new Error(
        `Token address not found for ${params.assetCode.toUpperCase()} on ${chain}`,
      );
    }

    if (!this.isValidAddress(to) || !this.isValidAddress(tokenAddress)) {
      throw new Error('Invalid recipient or token address');
    }

    const network = BlockchainNetworkSettings[chain];

    const provider = this.getProvider(chain);
    const wallet = new Wallet(network.secretKey, provider);

    const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, wallet);

    const decimals = await tokenContract
      .decimals()
      .catch(() => DEFAULT_DECIMALS);
    const amountInUnits = ethers.parseUnits(amount, decimals);

    // const tx = await tokenContract.transfer(to, amountInUnits);
    // await tx.wait();

    return { txHash: 'tx-hash', sourceAddress: 'source' };
  }

  async estimateTokenTransferFee(params: {
    from: string;
    to: string;
    tokenAddress: string;
    chain: SupportedBlockchainTypeEnum;
  }): Promise<number | any> {
    // const { from, to, tokenAddress, chain } = params;
    // const provider = this.getProvider(chain);
    // const tokenContract = new ethers.Contract(
    //   tokenAddress,
    //   ERC20_ABI,
    //   provider,
    // );
    // const gasPrice = await provider.getGasPrice();
    // const estimatedGas = await tokenContract.estimateGas.transfer(to, 1n, {
    //   from,
    // });
    // const totalFee = gasPrice * estimatedGas;
    // return parseFloat(ethers.formatEther(totalFee));
  }
}

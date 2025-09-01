import {
  Contract,
  ethers,
  formatEther,
  JsonRpcProvider,
  parseUnits,
  Wallet,
} from 'ethers';
import type { AbiItem } from 'web3-utils';
import {
  BlockchainNetworkSettings,
  SupportedBlockchainTypeEnum,
  TokenAddresses,
} from '@/v1/config/settings';
import { HttpStatus, Logger } from '@nestjs/common';
import { CustomHttpException } from '@/v1/middleware/custom.http.exception';
import { WalletErrorEnum } from '@/v1/models/wallet-manager.types';

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
  {
    constant: false,
    inputs: [
      { name: '_to', type: 'address' },
      { name: '_value', type: 'uint256' },
    ],
    name: 'transfer',
    outputs: [{ name: '', type: 'bool' }],
    type: 'function',
  },
];

const DEFAULT_DECIMALS = 18;

export class EtherService {
  private readonly logger = new Logger(EtherService.name);

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
  }): Promise<{
    txHash: string;
    sourceAddress: string;
    estimatedFee: string;
    destinationAddress: string;
  }> {
    const { to, amount, assetCode, chain } = params;

    const provider = this.getProvider(chain);
    const networkInfo = BlockchainNetworkSettings[chain];
    const tokenAddress = TokenAddresses[chain]?.[assetCode];

    if (!tokenAddress) {
      this.logger.error(
        `Token address not found for ${assetCode.toUpperCase()} on ${chain}`,
      );
      throw new Error(
        `Token address not found for ${assetCode.toUpperCase()} on ${chain}`,
      );
    }

    if (!this.isValidAddress(to) || !this.isValidAddress(tokenAddress)) {
      this.logger.error('Invalid recipient or token address');
      throw new Error('Invalid recipient or token address');
    }

    const wallet = new Wallet(networkInfo.secretKey, provider);
    const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, wallet);

    const decimals = await tokenContract
      .decimals()
      .catch(() => DEFAULT_DECIMALS);
    const amountInUnits = ethers.parseUnits(amount, decimals);

    const balance = await this.getTokenBalance(
      tokenAddress,
      wallet.address,
      chain,
    );
    const balanceInUnits = ethers.parseUnits(balance.toString(), decimals);

    if (balanceInUnits < amountInUnits) {
      this.logger.error(
        `Insufficient balance: Wallet ${wallet.address} has ${balance}, needs ${amount} ${assetCode}`,
      );
      throw new CustomHttpException(
        WalletErrorEnum.BALANCE_LOW,
        HttpStatus.BAD_REQUEST,
      );
    }

    const estimatedFee = await this.estimateTokenTransferFee({
      from: wallet.address,
      to,
      tokenAddress,
      chain,
      amount,
    });

    // const tx = await tokenContract.transfer(to, amountInUnits);
    // await tx.wait();

    return {
      txHash: 'tx-hash',
      sourceAddress: wallet.address,
      estimatedFee,
      destinationAddress: to,
    };
  }

  // async transferToken(params: {
  //   to: string;
  //   amount: string;
  //   assetCode: string;
  //   chain: SupportedBlockchainTypeEnum;
  // }): Promise<{ txHash: string; sourceAddress: string }> {
  //   const { to, amount, assetCode, chain } = params;

  //   const provider = this.getProvider(chain);
  //   const networkInfo = BlockchainNetworkSettings[chain];
  //   const tokenAddress = TokenAddresses[chain]?.[assetCode];

  //   if (!tokenAddress) {
  //     this.logger.error(
  //       `Token address not found for ${assetCode.toUpperCase()} on ${chain}`,
  //     );
  //     throw new Error(
  //       `Token address not found for ${assetCode.toUpperCase()} on ${chain}`,
  //     );
  //   }

  //   if (!this.isValidAddress(to) || !this.isValidAddress(tokenAddress)) {
  //     this.logger.error('Invalid recipient or token address');
  //     throw new Error('Invalid recipient or token address');
  //   }

  //   const wallet = new Wallet(networkInfo.secretKey, provider);
  //   const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, wallet);

  //   const decimals = await tokenContract
  //     .decimals()
  //     .catch(() => DEFAULT_DECIMALS);
  //   const amountInUnits = ethers.parseUnits(amount, decimals);

  //   const balance = await this.getTokenBalance(
  //     tokenAddress,
  //     wallet.address,
  //     chain,
  //   );

  //   const balanceInUnits = ethers.parseUnits(balance.toString(), decimals);

  //   if (balanceInUnits < amountInUnits) {
  //     this.logger.error(
  //       `Insufficient balance: Wallet ${wallet.address} has ${balance}, needs ${amount} ${assetCode}`,
  //     );
  //     throw new CustomHttpException(
  //       WalletErrorEnum.BALANCE_LOW,
  //       HttpStatus.BAD_REQUEST,
  //     );
  //   }

  //   // const tx = await tokenContract.transfer(to, amountInUnits);
  //   // await tx.wait();

  //   return {
  //     txHash: 'tx-hash',
  //     sourceAddress: wallet.address,
  //   };
  // }

  // async estimateTokenTransferFee(params: {
  //   from: string;
  //   to: string;
  //   tokenAddress: string;
  //   chain: SupportedBlockchainTypeEnum;
  // }): Promise<number> {
  //   const { from, to, tokenAddress, chain } = params;

  //   const provider = this.getProvider(chain) as JsonRpcProvider;

  //   const tokenContract = new Contract(tokenAddress, ERC20_ABI, provider);

  //   const gasPrice = await provider.send('eth_gasPrice', []);

  //   const estimatedGas = await tokenContract.estimateGas[
  //     'transfer(address,uint256)'
  //   ](to, 1n, {
  //     from,
  //   });

  //   const totalFee = BigInt(gasPrice) * estimatedGas;

  //   return parseFloat(formatEther(totalFee));
  // }
  async estimateTokenTransferFee(params: {
    from: string;
    to: string;
    tokenAddress: string;
    chain: SupportedBlockchainTypeEnum;
    amount: string;
  }): Promise<string> {
    const { from, to, amount, tokenAddress, chain } = params;

    const provider = this.getProvider(chain);
    const networkInfo = BlockchainNetworkSettings[chain];

    const wallet = new ethers.Wallet(networkInfo.secretKey, provider);
    const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, wallet);

    const decimals = await tokenContract
      .decimals()
      .catch(() => DEFAULT_DECIMALS);

    const amountInUnits = ethers.parseUnits(amount, decimals);

    const gasPrice = await provider.getFeeData().then((fee) => fee.gasPrice);

    if (!gasPrice) throw new Error('Failed to fetch gas price');

    const estimatedGas = await tokenContract.transfer.estimateGas(
      to,
      amountInUnits,
    );

    const totalFee = gasPrice * estimatedGas;

    const totalFeeInEth = ethers.formatEther(totalFee);

    this.logger.log(
      `Estimated gas fee for transferring ${amount} tokens: ${totalFeeInEth} ETH (gasPrice: ${gasPrice.toString()}, gasLimit: ${estimatedGas.toString()})`,
    );

    return totalFeeInEth;
  }

  getPrivateKeyFromMnemonic(mnemonic: string): string {
    try {
      const wallet = Wallet.fromPhrase(mnemonic);
      return wallet.privateKey;
    } catch (error) {
      throw new Error('Invalid mnemonic or derivation path');
    }
  }
}

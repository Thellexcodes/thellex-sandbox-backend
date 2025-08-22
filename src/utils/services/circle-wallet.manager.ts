import fetch from 'node-fetch';
import * as forge from 'node-forge';
import {
  registerEntitySecretCiphertext,
  initiateDeveloperControlledWalletsClient,
  CircleDeveloperControlledWalletsClient,
} from '@circle-fin/developer-controlled-wallets';
import { getAppConfig } from '@/constants/env';
import { Injectable } from '@nestjs/common';

export class CircleWalletManagerService {
  apiKey: string;
  publicKeyPem: string;
  entitySecret: string;
  encryptedEntitySecret: string;
  client: CircleDeveloperControlledWalletsClient | null;

  constructor() {
    this.apiKey = getAppConfig().CWALLET.API_KEY;
    this.publicKeyPem = null;
    this.entitySecret = null;
    this.encryptedEntitySecret = null;
    this.client = null;
  }

  async fetchPublicKey() {
    const url = 'https://api.circle.com/v1/w3s/config/entity/publicKey';

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
    });

    const data = await response.json();
    this.publicKeyPem = data?.data?.publicKey;
    if (!this.publicKeyPem) throw new Error('Failed to fetch public key.');

    const singleLineKey = this.publicKeyPem.replace(/\r?\n/g, '');
    console.log('✅ Public Key (PEM, Single Line):', singleLineKey);
  }

  generateEntitySecret() {
    this.entitySecret = getAppConfig().CWALLET.ENTITY_SECRET;
    // const bytes = forge.random.getBytesSync(32);
    // this.entitySecret = forge.util.bytesToHex(bytes);
    // console.log('✅ Entity Secret:', this.entitySecret);
  }

  encryptEntitySecret() {
    if (!this.publicKeyPem || !this.entitySecret) {
      throw new Error('Missing public key or entity secret');
    }

    const publicKey = forge.pki.publicKeyFromPem(this.publicKeyPem);
    const secretBytes = forge.util.hexToBytes(this.entitySecret);

    const encrypted = publicKey.encrypt(secretBytes, 'RSA-OAEP', {
      md: forge.md.sha256.create(),
      mgf1: { md: forge.md.sha256.create() },
    });

    this.encryptedEntitySecret = forge.util.encode64(encrypted);
    console.log(
      '✅ Encrypted Entity Secret (Base64):',
      this.encryptedEntitySecret,
    );
  }

  async registerEncryptedEntitySecret() {
    if (!this.encryptedEntitySecret) {
      throw new Error('Encrypted entity secret not available');
    }

    const response = await registerEntitySecretCiphertext({
      apiKey: this.apiKey,
      entitySecret: this.encryptedEntitySecret,
    });

    return response.data?.recoveryFile;
  }

  async initializeWalletClient() {
    if (!this.entitySecret) throw new Error('Entity secret missing');

    this.client = initiateDeveloperControlledWalletsClient({
      apiKey: this.apiKey,
      entitySecret: this.entitySecret,
    });
  }

  async createWalletSet(name) {
    if (!this.client) throw new Error('Wallet client not initialized');

    const response = await this.client.createWalletSet({ name });
    return response;
  }

  async setupWalletSet(walletSetName) {
    this.generateEntitySecret();
    await this.fetchPublicKey();
    this.encryptEntitySecret();
    // const recoveryFile = await this.registerEncryptedEntitySecret();
    // console.log({ recoveryFile });

    // await this.initializeWalletClient();
    // const walletSet = await this.createWalletSet(walletSetName);

    return {};
  }
}

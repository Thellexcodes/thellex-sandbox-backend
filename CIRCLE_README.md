# Thellex POS - Merchant Payment System with Circle USDC Integration

## Overview

Thellex POS is a state-of-the-art merchant payment platform that streamlines USDC transactions using Circle’s Developer-Controlled Wallets (DCW). Powered by a NestJS backend, PostgreSQL database, and Swagger-documented APIs, Thellex POS enables merchants to securely manage USDC wallets, process payments, and integrate fiat on/off-ramping for a seamless financial experience. With an Android app (Kotlin, Jetpack Compose) and a merchant web app (React/Next.js), Thellex POS is set to launch by **July 1, 2025**, aligning with Circle’s mission to drive financial inclusion through Web3 technologies. This project is submitted for Circle’s Developer Grant Program to showcase innovative USDC integration for merchant payments.

## Why Thellex POS?

- **Merchant Empowerment**: Simplifies USDC payments for small businesses.
- **Crypto/Fiat Integration**: Supports USDC for crypto transactions and fiat on/off-ramping via Circle’s APIs, bridging digital and traditional finance.
- **Security and Scalability**: Leverages Circle’s multi-party computation (MPC) for USDC wallet security and NestJS/PostgreSQL for robust performance.
- **Grant Alignment**: Advances Circle’s vision of financial inclusion by providing accessible, secure USDC payment tools.
- **Launch-Ready**: Fully functional, launching by July, 2025.

## Features

- **USDC Wallet Management**: Create and manage secure, developer-controlled wallets for merchants and users on Stellar and Polygon using Circle’s DCW APIs.
- **USDC Payments**: Enable merchants to accept USDC deposits and process transfers with real-time tracking.
- **Fiat On/Off-Ramping**: Convert USDC to fiat (e.g., NGN, GHC, etc.) for payouts or deposit fiat to purchase USDC, using Circle’s APIs.
- **Gas Abstraction**: Utilize Circle’s Gas Station to sponsor gas fees for USDC transactions, ensuring a frictionless experience.
- **Cross-Platform Access**: Includes a backend API, Android app, and merchant web app for comprehensive USDC payment management.
- **API Documentation**: Swagger-based API docs at `https://thellex.readme.io/reference/appcontroller_gethello`.

## Crypto/Fiat Integration

- **Crypto (USDC)**: Thellex POS uses Circle’s DCW to create USDC wallets for merchants and users, supporting deposits and transfers on Stellar (Testnet) and Polygon (Amoy). Transactions are secured with Circle’s MPC technology and gas-abstracted for simplicity.
- **Fiat On/Off-Ramping**: Merchants can convert USDC to fiat currencies (e.g., USD, EUR) for payouts or deposit fiat to acquire USDC.

## Architecture

Thellex POS is architected for scalability and security:

- **Backend API**: A NestJS-based microservices framework integrating Circle’s DCW for USDC wallet creation, payments, and fiat conversion, with PostgreSQL for data persistence.
- **Android App**: Built with Kotlin and Jetpack Compose, integrating Circle’s Android SDK for USDC wallet management and transactions.
- **Merchant Web App**: A React/Next.js dashboard for merchants to process USDC payments, manage fiat payouts, and view analytics.
- **Circle DCW Integration**: Powers USDC wallet creation and gas-abstracted transactions on Stellar and Polygon.

## Prerequisites

- **Circle Developer Account**: Obtain API keys at [Circle Developer Console](https://developers.circle.com).
- **Node.js**: Version 18.x or higher for NestJS.
- **PostgreSQL**: Version 14.x or higher for data storage.
- **Android SDK**: Android Studio (latest stable version) for the mobile app.
- **Supported Blockchains**: Stellar (Testnet), Polygon (Amoy) for USDC transactions.

## Installation

1. **Clone the Repositories**:
   ```bash
   git clone https://github.com/Thellexcodes/thellex-sandbox-backend
   git clone https://github.com/Thellexcodes/Thellex-Consumer-Kotlin
   git clone https://github.com/Thellexcodes/thellex-v2-client
   ```

## Circle DCW Integration

Thellex POS integrates Circle’s DCW to manage USDC wallets and transactions. Below are key methods implemented in the NestJS backend to handle wallet creation:

## Create Wallet Set

This method creates a wallet set for a user, associating it with their unique idempotency key created when creating the user and storing the profile in PostgreSQL.

```javascript
async createWalletSet(user: UserEntity): Promise<WalletSetResponseData> {
  try {
    const response = await this.circleClient.createWalletSet({
      name: user.idempotencyKey,
    });

    const walletSetRes = response.data.walletSet as WalletSet & {
      name: string;
    };

    if (user.cWalletProfile) {
      return response.data;
    }

    // Create new profile if it doesn’t exist
    const newProfile = new CwalletProfilesEntity();
    newProfile.user = user;
    newProfile.displayName = walletSetRes.name;
    newProfile.walletSetId = walletSetRes.id;
    newProfile.createdAt = new Date(walletSetRes.createDate);
    newProfile.updatedAt = new Date(walletSetRes.updateDate);

    await this.cWalletProfilesRepo.save(newProfile);

    return response.data;
  } catch (error) {
    console.log('Failed to create wallet:', error);
    throw error;
  }
}
```

- Purpose: Initializes a wallet set for a user, enabling multiple USDC wallets to be grouped under a single entity.
- Usage: Called during user registration to create a wallet set linked to the user’s profile.
- Error Handling: Logs errors for debugging; a custom error handler is planned (TODO).

## Create Wallet

This method creates a single USDC wallet within a wallet set, associating it with a user’s profile and saving it to PostgreSQL.

```javascript
async createWallet(
  walletSetId: string,
  blockchains: Blockchain[],
  user: UserEntity,
): Promise<ICwallet> {
  const response = await this.circleClient.createWallets({
    walletSetId,
    blockchains,
    count: 1,
    accountType: 'SCA',
  });

  const walletData = response.data.wallets[0] as Wallet & {
    accountType: string;
    scaCore: string;
  };

  const profile = await this.cWalletProfilesRepo.findOne({
    where: { user: { id: user.id } },
  });

  if (!profile) {
    throw new Error('Wallet profile not found for user.');
  }

  const newWallet = new CwalletsEntity();
  newWallet.walletID = walletData.id;
  newWallet.profile = profile;
  newWallet.address = walletData.address;
  newWallet.defaultNetwork = walletData.blockchain;
  newWallet.custodyType = walletData.custodyType;
  newWallet.blockchain = walletData.blockchain;
  newWallet.accountType = walletData.accountType;
  newWallet.state = walletData.state;
  newWallet.scaCore = walletData.scaCore;
  newWallet.createdAt = new Date(walletData.createDate);
  newWallet.updatedAt = new Date(walletData.updateDate);

  newWallet.reference = null;
  newWallet.currency = 'USD';
  newWallet.totalPayments = null;
  newWallet.balance = null;

  return await this.cWalletsRepo.save(newWallet);
}
```

- **Purpose:** Creates a USDC wallet on specified blockchains (Stellar or Polygon) within a wallet set, linked to a user’s profile.

- **Usage:** Called after wallet set creation to provision a wallet for USDC transactions.

- **Error Handling:** Throws an error if the user’s wallet profile is not found, ensuring data integrity.

## Additional Integration

- **Transfers:** Execute USDC transfers using Circle’s transaction APIs:

```javascript
const transferResponse = await client.createTransaction({
  walletId: '[user-wallet-id]',
  tokenId: '[usdc-token-id]',
  destinationAddress: '[recipient-address]',
  amount: [{ amount: '10.00', currency: 'USD' }],
  feeLevel: 'MEDIUM',
});
```

- **Wallet and Transaction Methods**

```javascript
async getWallet(walletId: GetWalletInput): Promise<CwalletResponse> {
  try {
    const response = await this.circleClient.getWallet(walletId);
    return response;
  } catch (error) {
    console.error('Failed to fetch wallet:', error);
    throw error;
  }
}

async getWalletTokenBalance(walletId: string): Promise<CwalletBalanceResponse> {
  try {
    const response = await this.circleClient.getWalletTokenBalance({
      id: walletId,
    });
    return response;
  } catch (error) {
    console.error('Failed to get wallet token balance:', error);
    throw error;
  }
}

async createTransaction(
  walletId: string,
  tokenId: string,
  destinationAddress: string,
  amount: string[],
): Promise<CwalletTransactionResponse> {
  try {
    const response = await this.circleClient.createTransaction({
      walletId,
      tokenId,
      destinationAddress,
      fee: {
        type: 'level',
        config: {
          feeLevel: 'HIGH', // Options: LOW, MEDIUM, HIGH
        },
      },
      amounts: amount,
    });
    return response;
  } catch (error) {
    console.error('Failed to create transaction:', error);
    throw error;
  }
}

async getBalanceByAddress(
  id: string,
  token: TokenEnum,
  network: SupportedBlockchainType,
): Promise<number> {
  if (!getSupportedNetwork(network, token)) {
    throw new Error(`Token ${token} not supported on ${network}`);
  }
  const normalizedTokenName = token.toUpperCase();

  const response = await this.circleClient
    .getWalletTokenBalance({
      id,
      name: normalizedTokenName,
    })
    .then((d) => d.data);

  return Number(response.tokenBalances[0].amount || 20);
}

  async validateAddress(data: IValidateAddress): ValidateAddressDataResponse {
    const response = await this.circleClient.validateAddress(data);
    return response.data;
  }

  async estimateTransferFee(
    data: IEstimateTransferFee,
  ): EstimateTransactionFeeDataResponse {
    const response = await this.circleClient.estimateTransferFee(data);
    return response.data;
  }

```

### Completed Integrations

- **Webhooks**: Real-time event delivery system to notify merchants of:

  - Successful payments
  - Payout status updates

  ### Upcoming Integrations

- **Gas Sponsorship for DCW**: Automatically subsidize gas fees for USDC transactions, enabling frictionless merchant onboarding and payments even without native chain tokens.

## Usage

- **Merchant/User Registration:**

  - Register via the Android app or merchant web app.
  - The backend calls createWalletSet and createWallet to provision USDC wallets.

- **USDC Transactions:**

  - Deposit USDC on Stellar or Polygon.
  - Initiate gas-sponsored USDC transfers.

- **Fiat Conversion:**

  - Convert USDC to fiat for payouts or deposit fiat to purchase USDC.

- **Merchant Dashboard:**
  - Access the web app to view USDC transactions, process payments, and manage fiat payouts.

# Fiat On-Ramping and KYC Flow

To ensure a compliant and secure fiat on/off-ramping experience, **Thellex POS** integrates with **Dojah** for KYC and connect with **Circle’s payment network partners** like **Yellow Card and Visa** for fiat entry/exit points across supported geographies.

---

## KYC with Dojah

### Integration

- **Dojah** is used to perform real-time identity verification for merchants and users before enabling fiat-related services.

### Verification Steps

1. During registration or first-time fiat use, users must complete identity verification using **Dojah's SDK**, embedded in both backend.
2. The **Dojah KYC results** (e.g., BVN, NIN, or document verification depending on region) are sent to the backend.
3. Only **verified users** are provisioned for fiat deposit/withdrawal and linked to fiat payment partners.

### Compliance

- Ensures that all user data is verified and stored according to regulatory standards required by **Circle’s network partners**.

---

## Fiat Integration via Circle + Yellow Card

### Overview

- **Thellex POS** uses **Circle’s Payments and Payouts APIs** to convert fiat to **USDC** and vice versa.
- Actual fiat rails (e.g., local bank transfers or mobile money) are handled by **network partners** like **Yellow Card**.

### Flow

#### Fiat Deposit

1. After passing KYC, a merchant/user initiates a deposit in their local fiat currency.
2. The request is routed through **Yellow Card** (or similar partner) for local processing.
3. Once the fiat is received, **Circle’s API** mints the equivalent **USDC** into the user’s wallet.

#### Fiat Withdrawal

1. The user initiates a fiat payout request.
2. Thellex backend initiate a fiat payout with USDC.
3. Funds are sent to the user via the partner (e.g., **Yellow Card**) using **bank or mobile money infrastructure**.

### Supported Regions

- Focused on regions supported by **Yellow Card** (e.g., Nigeria, Ghana, South Africa).
- Expandable to other partners based on **Circle’s ecosystem**.

---

## Benefits

- **Regulatory Compliance**: Ensures all fiat transactions are tied to verified identities via Dojah.
- **Localized Experience**: Fiat entry and exit are tailored to regional infrastructure (e.g., mobile money in Africa).
- **Circle-Certified Path**: Leverages partners listed under **Circle’s Payment Partner Network** for seamless fiat movement.

---

## Architecture

### Transaction Lifecycle Flow

#### 1. Payment Initiation

- Merchant generates a **QR code** or **payment link** via the POS app.
- Customer scans or taps the link and is prompted to pay in crypto (**USDC** or accepted stablecoins).

#### 2. Verification and Confirmation

- Backend verifies transaction confirmation **on-chain using Circle’s APIs**.

#### 3. Settlement

- **USDC** is credited to the merchant’s **programmable wallet**.
- Merchant can request a **fiat payout** or hold USDC.

#### 4. Admin Oversight

- Any **flagged transaction or dispute** is routed to the **admin dashboard**.

# Go-to-Market (GTM) Strategy for Thellex POS

## Objective

Launch Thellex POS as the leading merchant payment platform for USDC and USDT transactions with fiat on/off-ramping.

- Onboard 100 pilot businesses by **July, 2025**
- Scale to 500 active merchants by **Q4 2025**

The Circle grant will speed up development completion and GTM execution to drive adoption in key regions (Nigeria, Ghana, South Africa).

---

## Target Audience

### Primary Audience

- Small-to-medium merchants (retail, hospitality,logistics, e-commerce) in Yellow Card-supported regions (Nigeria, Ghana, South Africa)
- Business owners aged 25–50, tech-savvy, annual revenues under $1M
- Goals: reduce transaction fees, access Web3 customers + additional fiat customers

**Pain Points:**

- High card payment fees
- Slow fiat settlements
- Limited crypto payment options

### Secondary Audience

- Individual users (freelancers, consumers) in supported regions for peer-to-peer USDC/USDT payments
- Freelancers and crypto-native individuals making P2P transactions
- Users on the 2,000-person waitlist, early adopters, and stablecoin holders [waitlist](https://drive.google.com/drive/folders/1LGu8uJyiZvhysX68oJUE1M0jyZYS_b_L?usp=sharing)

---

## Value Proposition

Thellex POS enables merchants to:

- Accept USDC and USDT with low fees (~1% vs. 2–5% for cards)
- Convert crypto to fiat instantly via Circle’s Payouts API and Yellow Card’s local rails (mobile money, bank transfers)
- Ensure compliance with Dojah KYC for secure onboarding
- Benefit from gas-free USDC transactions via Circle’s Gas Station
- Access a user-friendly Android app and web dashboard for transaction management
- POS App + Web dashboard for all transaction management

---

## GTM Phases

### 1. Pre-Launch (Q2 2025: April–June)

**Objective:** Finalize development, secure partnerships, and prepare pilot businesses

**Development (Circle Grant funded):**

- Optimize NestJS backend for scalability, integrate Circle’s Payments/Payouts APIs and Quidax APIs
- Enhance Android app with Dojah KYC SDK and Circle SDK
- Complete merchant web dashboard for transaction analytics and fiat payouts
- Conduct sandbox testing for USDC (Stellar, Polygon) and USDT (Tron, BEP20)

**Partnerships:**

- ✅ Partnered with **Yellow Card** for fiat on/off-ramping in **Nigeria**, **Ghana**, and **South Africa** — [View Document](https://drive.google.com/drive/folders/1QLkrRQm9OFeobZfNSjgMjP8UyXKRLcWt?usp=sharing)
- ✅ Partnered with **Quidax** for regulatory **compliance** — [View Document](https://drive.google.com/drive/folders/1QLkrRQm9OFeobZfNSjgMjP8UyXKRLcWt?usp=sharing)
- ✅ Partnered with **Dojah API** for **KYC** and user verification — [View Document](https://drive.google.com/drive/folders/1QLkrRQm9OFeobZfNSjgMjP8UyXKRLcWt?usp=sharing)

**Pilot Recruitment:**

- Convert 100 of 140+ businesses in talks into pilot participants
- Offer incentives
- Conduct webinars and demos showcasing USDC/USDT payments and fiat conversion

**Marketing Preparation:**

- Launch Thellex Beta Testing New Homepage
- Create promotional social media videos (Instagram, Twitter) targeting merchants
- Prepare email campaigns emphasizing low fees and fast settlements
- Go to markets in Lagos, Aba, Onitsha, Enugu, Abuja with our agents to campaign and onboard more business

**Metrics:**

- 100+ pilot businesses confirmed
- Backend uptime: 99.9%
- KYC completion time: <5 minutes

---

### 2. Launch (Q3 2025: July–September)

**Objective:** Onboard 100 pilot businesses, drive initial transactions, gather feedback

**Onboarding:**

- Deploy account managers to assist pilot businesses
- Register users via Android app or web portal
- Complete Dojah KYC (BVN, NIN, or document verification)
- Provision USDC wallets and link fiat accounts via Yellow Card

**Training:**

- Provide videos, PDFs on accepting USDC/USDT and fiat conversion

**Marketing Execution:**

- Launch email campaign: “Accept USDC/USDT/Fiat with Thellex POS – Start Today!”
- Run targeted ads on Twitter and Instagram in Nigeria, Ghana, South Africa
- Partner with local business associations (Agency Bankers) for referrals

**Support:**

- 24/7 chat and email support for pilot businesses
- Monitor transaction success and KYC approval rates

**Feedback Collection:**

- Weekly surveys to identify pain points (app UX, settlement speed)
- Use feedback to prioritize Q4 improvements

**Metrics:**

- 100 businesses onboarded by August 31
- 80% KYC approval rate
- 1,000 transactions processed (USDC/USDT)

---

### 3. Expansion (Q4 2025: October–December)

**Objective:** Scale to 500 active merchants, optimize platform, expand regions

**Scaling:**

- Onboard 400 additional merchants from leads
- Expand to new Yellow Card-supported regions (Ghana, Kenya, Uganda, South Africa)
- Improve Automation of onboarding with self-service KYC and wallet setup

**Marketing:**

- Launch referral program: $50 USDC credit per referred merchant
- Publish pilot case studies
- Attend trade shows (Africa Tech Festival) to demo POS

**Metrics:**

- 500 active merchants by Dec 31
- 10,000 transactions processed
- 90% merchant retention
- $500,000+ transaction volume

---

### 4. Post-Launch (Q1 2026: January–March)

**Objective:** Establish market leadership, prepare global expansion

**Growth:**

- Target 2,000 merchants across Africa, explore Southeast Asia
- Introduce USDC staking for merchants to earn yield

**Product Enhancements:**

- Multi-currency support (EUR, GBP) for fiat payouts
- Develop iOS app
- Support visa debit cards

**Marketing:**

- Global campaign: “Thellex POS: Powering Stablecoin Payments Worldwide”
- Media coverage in tech and fintech outlets

**Metrics:**

- 2,000 merchants
- $2M transaction volume
- 95% transaction success rate

---

## Channels

- Direct Sales: Account managers for pilot and key merchants
- Digital Marketing: Twitter, Instagram, Google Ads in Nigeria, Ghana, South Africa
- Partnerships: Yellow Card, Dojah, local business associations, Circle’s Payment Partner Network
- Events: Trade shows, webinars, business meetups
- Referrals: Merchant referral program with USDC incentives

---

## Customer Acquisition Strategy

### Acquisition

- Leverage 140+ businesses in talks for pilot phase
- Use targeted ads and webinars to convert leads

### Retention

- 24/7 support and regular app updates
- Loyalty discounts for long-term merchants

### Referral

- $50 USDC credit incentives for merchant referrals

---

## Budget (Circle Grant Allocation)

| Category           | Amount  |
| ------------------ | ------- |
| Development        | $25,000 |
| Marketing          | $20,000 |
| Onboarding/Support | $10,000 |
| Partnerships       | $5,000  |
| **Total**          | $60,000 |

> We're open to Circle offer, support is mainly to accelarate enhancements and market penetration

---

## Risks & Mitigation

| Risk               | Mitigation                                    |
| ------------------ | --------------------------------------------- |
| Low pilot adoption | Incentives, hands-on support                  |
| KYC delays         | Optimize Dojah SDK, streamline verification   |
| Fiat payout delays | Partner with reliable providers (Yellow Card) |
| Regulatory changes | Monitor compliance, work with Circle partners |

---

## Estimation of Amount Processed by End of Q4 2025

**Pilot Phase (Q3 2025):**

- 100 pilot businesses onboarded
- 10 transactions/merchant/month
- $50 average transaction value
- Total: 3,000 transactions, $150,000 volume

**Expansion Phase (Q4 2025):**

- 500 merchants total (100 pilot + 400 new)
- Transactions/month increasing (up to 15 per merchant)
- $60 average transaction value
- Total transactions: 16,485
- Total volume: $989,100

**Combined Volume:**

- Q3 + Q4 = ~$1,139,100

**Conservative Estimate:**

- Assuming 50% adoption, target $500,000 by Q4 2025

---

## Additional Factors

- Stablecoin split: 50% USDC, 50% USDT
- Fiat conversion: 50% converted via Yellow Card
- Market context: Nigeria’s crypto volume (~$56B in 2023 per Chainalysis) supports stablecoin adoption

---

## Rationale

- $500,000 target is achievable with 500 merchants processing modest volumes
- Circle grant supports marketing and onboarding to convert leads into active merchants

# Launch Timeline

Thellex POS is on track for a public launch by July 2025, delivering a merchant-ready USDC payment solution with fiat integration.

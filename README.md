# 🧾 Thellex POS – Crypto & Fiat Payments

## Overview

Thellex POS is a modern merchant payment platform that enables seamless USDC and USDT transactions across multiple blockchains, with fiat on/off-ramping for real-world usability. Built with a **NestJS backend**, **PostgreSQL database**, **Android mobile app** (Kotlin), and **merchant web dashboard** (React/Next.js), Thellex POS integrates:

- **Circle’s Developer-Controlled Wallets (DCW)** for secure USDC payments on Stellar (Testnet) and Polygon (Amoy).
- **Quidax APIs** for USDT support on Tron and BEP20 (Binance Smart Chain Testnet).
- **Dojah API** for robust KYC verification during onboarding.

Thellex POS is designed for flexibility, allowing merchants to accept both crypto and fiat while we handle wallet management, transaction security, and local bank withdrawals.

For Circle-specific details, see our [Circle README](CIRCLE_README.md).

## Key Features

- **Circle DCW Integration**: Create and manage USDC wallets for users/merchants on Stellar and Polygon, with gas sponsorship via Circle’s Gas Station.
- **Quidax Wallet Support**: Manage USDT wallets on Tron and BEP20 for multi-asset payments.
- **Gas Sponsorship**: Cover USDC transaction fees using Circle’s Gas Station for a frictionless user experience.
- **KYC with Dojah**: Ensure compliance with quick ID verification before wallet creation.
- **Secure Transactions**: Leverage Circle’s multi-party computation (MPC) for USDC and Quidax’s custodial security for USDT.
- **Fiat Off-Ramping**: Convert USDC/USDT to fiat (e.g., USD, EUR) and withdraw to local bank accounts via Circle and third-party providers.

## Components

| Component           | Description                                                                   |
| ------------------- | ----------------------------------------------------------------------------- |
| **Backend API**     | Built with NestJS, handles authentication, wallet creation, and transactions. |
| **Mobile App**      | Android app (Kotlin, Jetpack Compose) for merchants/users to manage payments. |
| **Merchant Portal** | React/Next.js dashboard to view orders, process payments, and track wallets.  |

## System Architecture

### Circle Integration

- **Wallet Creation**: Provision USDC wallets during user onboarding using Circle’s DCW.
- **USDC Transfers**: Manage secure, gas-abstracted USDC payments on Stellar and Polygon.
- **Gas Station**: Sponsor transaction fees for seamless user experience.

### Quidax Integration

- USDT Wallets: Manage USDT wallets and off-chain operations on Tron and BEP20 via Quidax APIs.
- Transaction Processing: Handle USDT deposits and transfers for merchants.

### KYC

- **Onboarding**: Users and merchants complete ID verification via Dojah API.
- **Compliance**: Ensures regulatory adherence for crypto and fiat transactions.

## Documentation & Integration Links

See: [Circle Developer Docs](https://developers.circle.com)  
**Our Circle Integration Code**: [circle-integration-readme](CIRCLE_README.md)

See also: [Quidax API Docs](https://docs.quidax.io/docs/getting-started)  
**Our Quidax Integration**: [quidax-integration-readme](QUIDAX_README.md)

## Repositories

| Repository              | Link                                                                                                                                                                                                       |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Backend API             | [git@github.com:Thellexcodes/thellex-sandbox-backend.git](https://github.com/Thellexcodes/thellex-sandbox-backend)                                                                                         |
| Android Mobile App      | [git@github.com:Thellexcodes/Thellex-Consumer-Kotlin.git](https://github.com/Thellexcodes/Thellex-Consumer-Kotlin)                                                                                         |
| Merchant Web Platform   | [git@github.com:Thellexcodes/merchant-v1.git](https://github.com/Thellexcodes/merchant-v1)                                                                                                                 |
| Consumer Web (to merge) | [git@github.com:Thellexcodes/thellex-v2-client.git](https://github.com/Thellexcodes/thellex-v2-client#)                                                                                                    |
| UI/UX Flow              | [https://www.figma.com/design/naJq0GrgjJv0q54qu9sqtL/Thellex?node-id=1415-42772&t=miQIQV8nivPm9lRZ-1](https://www.figma.com/design/naJq0GrgjJv0q54qu9sqtL/Thellex?node-id=1415-42772&t=miQIQV8nivPm9lRZ-1) |

> 🔁 Both Merchant Web/Consumer Web repos will be **merged into a single project** for unified deployment.

## Setup (For Developers)

- Clone the Repositories:

```bash
git clone git@github.com:Thellexcodes/thellex-sandbox-backend.git
git clone git@github.com:Thellexcodes/Thellex-Consumer-Kotlin.git
git clone git@github.com:Thellexcodes/merchant-v1.git
```

- Backend Requirements:
  - Node.js 18+
  - PostgreSQL 14+
  - Circle API keys Circle Developer Console
  - Quidax API keys Quidax API Docs
  - Dojah API key for KYC Dojah Docs

## Start the Backend:

```bash
cd backend
yarn install
cp .env.example .env
```

Update .env with API keys and PostgreSQL credentials.

```bash
yarn start:dev
```

## Android App Setup:

- Open android-app in Android Studio.
- Build and run using the app configuration.

## Merchant Web Platform Setup:

```bash
cd merchant-platform
npm install
npm run dev
```

## 📚 Documentation

- **API Docs**: [https://thellex.readme.io/reference/](https://thellex.readme.io/reference)
- **Circle Wallet Docs**: _Thellex POS API - Bridge Controller_
- **Circle README**: [CIRCLE_README.md](CIRCLE_README.md)

## Summary

Thellex POS empowers merchants to accept stablecoin payments (USDC via Circle, USDT via Quidax) with fiat off-ramping, secure KYC via Dojah, and developer-managed wallets. Tailored for Circle’s Developer Grant Program, it combines usability, security, and Web3 innovation, with a public launch planned for July 1, 2025.

## Diagrams (Planned)

The following diagrams will be added to the repositories’ /docs/architecture/ folders:

- Circle Wallet Creation Flow: Illustrates user onboarding, wallet set creation, and USDC wallet provisioning.
- USDC vs USDT Architecture: Compares Circle DCW (USDC) and Quidax (USDT) integration workflows.
- User Registration → KYC → Wallet Provisioning: Details the Dojah KYC process followed by Circle/Quidax wallet creation.

## Status:

Diagrams are in development using Draw.io and will be pushed to the repositories soon.

## Contributing

Contributions are welcome! See CONTRIBUTING.md for details.

## Contact

Reach dev at [samuel@thellex.com](mailto:samuel@thellex.com).  
API details at [Thellex POS API Docs](https://thellex.readme.io/reference).

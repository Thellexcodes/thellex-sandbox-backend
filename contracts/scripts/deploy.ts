// // scripts/deploy.ts
// import { ethers, network } from 'hardhat';
// import * as fs from 'fs';
// import * as path from 'path';

// async function main() {
//   const [deployer] = await ethers.getSigners();
//   console.log(
//     `🔑 Deploying with address: ${deployer.address} on network: ${network.name}`,
//   );

//   const ContractFactory = await ethers.getContractFactory('BatchTransferVault');
//   const contract = await ContractFactory.deploy();
//   await contract.waitForDeployment();

//   const address = await contract.getAddress();
//   console.log(`✅ Contract deployed at: ${address}`);

//   // Save address
//   const filePath = path.join(__dirname, '..', 'deployed.json');
//   let deployed: Record<string, string> = {};

//   if (fs.existsSync(filePath)) {
//     deployed = JSON.parse(fs.readFileSync(filePath, 'utf8'));
//   }

//   deployed[network.name] = address;

//   fs.writeFileSync(filePath, JSON.stringify(deployed, null, 2));
//   console.log('📦 Saved to deployed.json');
// }

// main().catch((error) => {
//   console.error('❌ Deployment failed:', error);
//   process.exit(1);
// });

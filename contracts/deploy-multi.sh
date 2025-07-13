#!/bin/bash

# List of Hardhat network names to deploy to
NETWORKS=("polygon" "bsc" "ethereum" "arbitrum" "optimism")

# Deploy script path
DEPLOY_SCRIPT="scripts/deploy.ts"

for NETWORK in "${NETWORKS[@]}"
do
  echo "🚀 Deploying to $NETWORK..."
  npx hardhat run $DEPLOY_SCRIPT --network $NETWORK

  if [ $? -ne 0 ]; then
    echo "❌ Deployment to $NETWORK failed!"
    exit 1
  else
    echo "✅ Deployment to $NETWORK completed!"
  fi

  echo "-----------------------------"
done

echo "🎉 All deployments completed!"
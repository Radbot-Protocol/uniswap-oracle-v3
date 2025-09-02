import { ethers } from "ethers";
import dotenv from "dotenv";
dotenv.config({ path: ".env" });

// Oracle ABI - you'll need to get this from your compiled contract
const ORACLE_ABI = [
  "function factory() view returns (address)",
  "function windowSize() view returns (uint256)",
  "function granularity() view returns (uint8)",
  "function periodSize() view returns (uint256)",
  "function pairObservations(address,uint256) view returns (uint256,uint256,uint256)",
  "function observationIndexOf(uint256) view returns (uint8)",
  "function getFirstObservationInWindow(address) view returns (uint256,uint256,uint256)",
  "function update(address,address)",
  "function consult(address,uint256,address) view returns (uint256)",
  "function KEEPER_ROLE() view returns (bytes32)",
  "function hasRole(bytes32,address) view returns (bool)",
];

interface UpdateConfig {
  oracleAddress: string;
  rpcUrl: string;
  privateKey: string;
  tokenPairs: Array<{
    tokenA: string;
    tokenB: string;
    name: string;
  }>;
  updateIntervalMinutes: number;
}

class OracleUpdater {
  private provider: ethers.JsonRpcProvider;
  private wallet: ethers.Wallet;
  private oracle: ethers.Contract;
  private config: UpdateConfig;
  private isRunning: boolean = false;
  private updateInterval: NodeJS.Timeout | null = null;

  constructor(config: UpdateConfig) {
    this.config = config;
    this.provider = new ethers.JsonRpcProvider(config.rpcUrl);
    this.wallet = new ethers.Wallet(config.privateKey, this.provider);
    this.oracle = new ethers.Contract(
      config.oracleAddress,
      ORACLE_ABI,
      this.wallet
    );
  }

  async start() {
    console.log("🚀 Starting Oracle Updater...");
    console.log("📊 Oracle Address:", this.config.oracleAddress);
    console.log("👤 Wallet Address:", this.wallet.address);
    console.log(
      "⏰ Update Interval:",
      this.config.updateIntervalMinutes,
      "minutes"
    );
    console.log("🔄 Token Pairs:", this.config.tokenPairs.length);
    console.log("=".repeat(60));

    // Check if wallet has keeper role
    await this.checkKeeperRole();

    this.isRunning = true;

    // Run initial update
    await this.performUpdate();

    // Set up interval for subsequent updates
    this.updateInterval = setInterval(async () => {
      if (this.isRunning) {
        await this.performUpdate();
      }
    }, this.config.updateIntervalMinutes * 60 * 1000);

    console.log("✅ Oracle Updater started successfully!");
    console.log("💡 Press Ctrl+C to stop the updater");
  }

  async stop() {
    console.log("\n🛑 Stopping Oracle Updater...");
    this.isRunning = false;

    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }

    console.log("✅ Oracle Updater stopped");
  }

  private async checkKeeperRole() {
    try {
      const keeperRole = await this.oracle.KEEPER_ROLE();
      const hasRole = await this.oracle.hasRole(
        keeperRole,
        this.wallet.address
      );

      if (!hasRole) {
        console.log("❌ Wallet does not have KEEPER_ROLE");
        console.log("💡 Please grant KEEPER_ROLE to:", this.wallet.address);
        throw new Error("Insufficient permissions");
      }

      console.log("✅ Wallet has KEEPER_ROLE");
    } catch (error) {
      console.error("❌ Error checking keeper role:", error);
      throw error;
    }
  }

  private async performUpdate() {
    const timestamp = new Date().toISOString();
    console.log(`\n🔄 [${timestamp}] Starting update cycle...`);

    let successCount = 0;
    let errorCount = 0;

    for (const pair of this.config.tokenPairs) {
      try {
        console.log(
          `📈 Updating ${pair.name} (${pair.tokenA} <-> ${pair.tokenB})...`
        );

        const tx = await this.oracle.update(pair.tokenA, pair.tokenB);
        console.log(`  ⏳ Transaction sent: ${tx.hash}`);

        const receipt = await tx.wait();
        console.log(
          `  ✅ Transaction confirmed in block: ${receipt?.blockNumber}`
        );

        successCount++;

        // Small delay between updates to avoid overwhelming the network
        await new Promise((resolve) => setTimeout(resolve, 2000));
      } catch (error) {
        console.error(`  ❌ Error updating ${pair.name}:`, error);
        errorCount++;
      }
    }

    console.log(
      `📊 Update cycle completed: ${successCount} successful, ${errorCount} errors`
    );

    // Show next update time
    const nextUpdate = new Date(
      Date.now() + this.config.updateIntervalMinutes * 60 * 1000
    );
    console.log(`⏰ Next update scheduled for: ${nextUpdate.toISOString()}`);
  }

  async getOracleStatus() {
    console.log("\n📊 Oracle Status:");
    console.log("=".repeat(40));

    try {
      const factory = await this.oracle.factory();
      const windowSize = await this.oracle.windowSize();
      const granularity = await this.oracle.granularity();
      const periodSize = await this.oracle.periodSize();

      console.log("Factory:", factory);
      console.log("Window Size:", windowSize.toString(), "seconds");
      console.log("Granularity:", granularity.toString());
      console.log("Period Size:", periodSize.toString(), "seconds");

      // Check current observation index
      const currentTimestamp = Math.floor(Date.now() / 1000);
      const currentIndex = await this.oracle.observationIndexOf(
        currentTimestamp
      );
      console.log("Current Observation Index:", currentIndex.toString());
    } catch (error) {
      console.error("❌ Error getting oracle status:", error);
    }
  }
}

// Configuration
const config: UpdateConfig = {
  oracleAddress: "0x0C9129255354ABC006E66a6D58EB3D9637CFF691", // Your deployed oracle address
  rpcUrl: "https://mainnet.base.org", // Base mainnet RPC
  privateKey: process.env.PRIVATE_KEY || "", // Set this in your environment variables
  tokenPairs: [
    {
      tokenA: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", // USDC
      tokenB: "0xbCC7F0E389638686Db5C0a3e54d11474f8c9bFC1", // WETH
      name: "USDC/WETH",
    },
    // Add more pairs as needed
    // {
    //   tokenA: "0x...",
    //   tokenB: "0x...",
    //   name: "TOKEN1/TOKEN2"
    // }
  ],
  updateIntervalMinutes: 2.5, // Update every minute
};

// Main execution
async function main() {
  if (!config.privateKey) {
    console.error("❌ PRIVATE_KEY environment variable is required");
    console.log("💡 Set it with: export PRIVATE_KEY=your_private_key_here");
    process.exit(1);
  }

  const updater = new OracleUpdater(config);

  // Handle graceful shutdown
  process.on("SIGINT", async () => {
    await updater.stop();
    process.exit(0);
  });

  process.on("SIGTERM", async () => {
    await updater.stop();
    process.exit(0);
  });

  try {
    // Show initial status
    // await updater.getOracleStatus();

    // Start the updater
    await updater.start();
  } catch (error) {
    console.error("❌ Failed to start oracle updater:", error);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main().catch((error) => {
    console.error("❌ Unhandled error:", error);
    process.exit(1);
  });
}

export { OracleUpdater, UpdateConfig };

import { ethers } from "ethers";

interface Observation {
  timestamp: number;
  price0Cumulative: string;
  price1Cumulative: string;
}

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
];

async function viewObservations() {
  // Configuration - Update these values as needed
  const ORACLE_ADDRESS = "0xA42310e6E9381f8bEb8950Bd7f1DfBBf3506E2EA"; // Replace with your deployed oracle address
  const PAIR_ADDRESS = "0x19efbaff6E7Fa1A0f7115249e8833b325F276002"; // The pair address you want to query

  // RPC URL - Update this to your network's RPC endpoint
  const RPC_URL = "https://mainnet.base.org"; // Base mainnet RPC
  const provider = new ethers.JsonRpcProvider(RPC_URL);

  console.log("🔍 Viewing Observations for Pair:", PAIR_ADDRESS);
  console.log("📊 Oracle Address:", ORACLE_ADDRESS);
  console.log("🌐 RPC URL:", RPC_URL);
  console.log("=".repeat(60));

  try {
    // Get the oracle contract instance
    const oracle = new ethers.Contract(ORACLE_ADDRESS, ORACLE_ABI, provider);

    // Get oracle configuration
    const factory = await oracle.factory();
    const windowSize = await oracle.windowSize();
    const granularity = await oracle.granularity();
    const periodSize = await oracle.periodSize();

    console.log("📋 Oracle Configuration:");
    console.log("  Factory:", factory);
    console.log("  Window Size:", windowSize.toString(), "seconds");
    console.log("  Granularity:", granularity.toString());
    console.log("  Period Size:", periodSize.toString(), "seconds");
    console.log("");

    // Get the number of observations for this pair
    const observationsLength = await oracle.pairObservations(PAIR_ADDRESS, 0);
    console.log("📈 Total Observations:", observationsLength.toString());
    console.log("");

    if (observationsLength.toString() === "0") {
      console.log("❌ No observations found for this pair address.");
      console.log("💡 Make sure the oracle has been updated for this pair.");
      return;
    }

    // Fetch all observations
    const observations: Observation[] = [];

    for (let i = 0; i < Number(observationsLength); i++) {
      try {
        const observation = await oracle.pairObservations(PAIR_ADDRESS, i);
        observations.push({
          timestamp: Number(observation.timestamp),
          price0Cumulative: observation.price0Cumulative.toString(),
          price1Cumulative: observation.price1Cumulative.toString(),
        });
      } catch (error) {
        console.log(`⚠️  Could not fetch observation at index ${i}`);
      }
    }

    // Display observations
    console.log("📊 Observations:");
    console.log("-".repeat(80));
    console.log("Index | Timestamp | Price0 Cumulative | Price1 Cumulative");
    console.log("-".repeat(80));

    observations.forEach((obs, index) => {
      const date = new Date(obs.timestamp * 1000).toISOString();
      const price0Formatted = formatLargeNumber(obs.price0Cumulative);
      const price1Formatted = formatLargeNumber(obs.price1Cumulative);

      console.log(
        `${index.toString().padStart(5)} | ${date} | ${price0Formatted.padStart(
          17
        )} | ${price1Formatted.padStart(17)}`
      );
    });

    console.log("-".repeat(80));
    console.log("");

    // Show current observation index
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const currentIndex = await oracle.observationIndexOf(currentTimestamp);
    console.log("🎯 Current Observation Index:", currentIndex.toString());
    console.log("⏰ Current Timestamp:", currentTimestamp);
    console.log("");

    // Show first observation in window
    // try {
    //   const firstObservation = await oracle.getFirstObservationInWindow(
    //     PAIR_ADDRESS
    //   );
    //   console.log("🔄 First Observation in Window:");
    //   console.log("  Timestamp:", firstObservation.timestamp.toString());
    //   console.log(
    //     "  Price0 Cumulative:",
    //     formatLargeNumber(firstObservation.price0Cumulative.toString())
    //   );
    //   console.log(
    //     "  Price1 Cumulative:",
    //     formatLargeNumber(firstObservation.price1Cumulative.toString())
    //   );
    // } catch (error) {
    //   console.log("⚠️  Could not fetch first observation in window");
    // }
  } catch (error) {
    console.error("❌ Error fetching observations:", error);
  }
}

function formatLargeNumber(num: string): string {
  const numBigInt = BigInt(num);
  if (numBigInt === 0n) return "0";

  // Convert to scientific notation for very large numbers
  const numStr = num.toString();
  if (numStr.length > 15) {
    const exp = numStr.length - 1;
    const mantissa = numStr.substring(0, 6);
    return `${mantissa}e${exp}`;
  }

  return numStr;
}

// Helper function to get observations for a specific token pair
async function getObservationsForTokenPair(tokenA: string, tokenB: string) {
  const ORACLE_ADDRESS = "0xA42310e6E9381f8bEb8950Bd7f1DfBBf3506E2EA"; // Replace with your deployed oracle address
  const RPC_URL = "https://mainnet.base.org"; // Base mainnet RPC
  const provider = new ethers.JsonRpcProvider(RPC_URL);

  try {
    const oracle = new ethers.Contract(ORACLE_ADDRESS, ORACLE_ABI, provider);

    // Get the pair address using the same logic as the oracle
    // Note: You'll need to implement the pairFor logic or call it from the contract
    const pairAddress = "0x19efbaff6E7Fa1A0f7115249e8833b325F276002";
    console.log("🔗 Pair Address for tokens:", pairAddress);

    // Now call the main function with this pair address
    await viewObservations();
  } catch (error) {
    console.error("❌ Error getting pair address:", error);
  }
}

// Main execution
if (require.main === module) {
  viewObservations()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export { viewObservations, getObservationsForTokenPair };

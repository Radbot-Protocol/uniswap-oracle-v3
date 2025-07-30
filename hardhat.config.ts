import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

import dotenv from "dotenv";
dotenv.config({ path: ".env" });

const config: HardhatUserConfig = {
  solidity: "0.7.6",
  networks: {
    sepolia: {
      url:
        process.env.SEPOLIA_RPC_URL ||
        "https://sepolia.infura.io/v3/your-project-id",
      accounts: process.env.SEPOLIA_PRIVATE_KEY
        ? [process.env.SEPOLIA_PRIVATE_KEY]
        : [],
      chainId: 11155111,
    },
  },

  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY as string,
  },
};

export default config;

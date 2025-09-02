import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

import dotenv from "dotenv";
dotenv.config({ path: ".env" });

const config: HardhatUserConfig = {
  solidity: "0.7.6",
  networks: {
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL as string,
      accounts: process.env.SEPOLIA_PRIVATE_KEY
        ? [process.env.SEPOLIA_PRIVATE_KEY]
        : [],
      chainId: 11155111,
    },

    base: {
      url: process.env.BASE_RPC_URL as string,
      accounts: process.env.BASE_PRIVATE_KEY
        ? [process.env.BASE_PRIVATE_KEY]
        : [],
    },
  },

  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY as string,
  },
};

export default config;

// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const OracleModuleV2 = buildModule("OracleModuleV3", (m) => {
  const oracle = m.contract("ObservableOracle", [
    "0x8909Dc15e40173Ff4699343b6eB8132c65e18eC6", // Uniswap V2 Factory on Base
    300, // 1 hour window
    2, // 60 observations
  ]);

  return { oracle };
});

export default OracleModuleV2;

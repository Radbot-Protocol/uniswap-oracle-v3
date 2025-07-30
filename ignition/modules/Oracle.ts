// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const OracleModule = buildModule("OracleModule", (m) => {
  const oracle = m.contract("StaticOracle", ["", 30]);

  return { oracle };
});

export default OracleModule;

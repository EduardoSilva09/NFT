import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const MultitokenModule = buildModule("MultitokenModule", (m) => {
  const Multitoken = m.contract("Multitoken");

  return { Multitoken };
});

export default MultitokenModule;

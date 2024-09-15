import { ethers, upgrades } from "hardhat";

async function main() {
  const Multitoken = await ethers.getContractFactory("Multitoken");
  const contract = await upgrades.upgradeProxy(`${process.env.CONTRACT_ADDRESS}`, Multitoken);

  await contract.waitForDeployment();
  const address = await contract.getAddress();

  console.log(`Contract updated at ${address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
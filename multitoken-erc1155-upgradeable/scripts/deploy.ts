import { ethers, upgrades } from "hardhat";

async function main() {
  const Multitoken = await ethers.getContractFactory("Multitoken");
  const contract = await upgrades.deployProxy(Multitoken);

  await contract.waitForDeployment();

  console.log(`Proxy deployed at ${contract.target}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
import { ethers } from "hardhat";

async function main() {
  const Multitoken = await ethers.getContractFactory("Multitoken");
  const contract = await Multitoken.deploy();

  await contract.waitForDeployment();
  const address = await contract.getAddress();

  console.log(`Contract was deployed at ${address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
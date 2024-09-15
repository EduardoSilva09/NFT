import { ethers } from "hardhat";

async function main() {
  const NFTMarket = await ethers.getContractFactory("NFTMarket");
  const contract = await NFTMarket.deploy();

  await contract.waitForDeployment();
  const address = await contract.getAddress();

  console.log(`Contract was deployed at ${address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
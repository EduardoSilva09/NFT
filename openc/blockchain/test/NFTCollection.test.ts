import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("NFT Collection", function () {
  async function deployFixture() {
    const [owner, otherAccount] = await ethers.getSigners();

    const NFTMarket = await ethers.getContractFactory("NFTMarket");
    const nftMarket = await NFTMarket.deploy();
    const marketAddress = await nftMarket.getAddress();

    const NFTCollection = await ethers.getContractFactory("NFTCollection");
    const nftCollection = await NFTCollection.deploy(marketAddress);

    return { nftCollection, owner, otherAccount, marketAddress };
  }

  it("should successfully mint a new token and set its metadata URI", async function () {
    const { nftCollection } = await loadFixture(deployFixture);

    // Act: Mint a new token with a specific metadata URI
    await nftCollection.mint("ipfs://metadatauritoken/1.json");

    // Assert: Verify that the token URI of the newly minted token is correctly set
    expect(await nftCollection.tokenURI(1))
      .to.equal("ipfs://metadatauritoken/1.json");
  });

  it("should correctly change approval status for an operator", async function () {
    const { nftCollection, otherAccount, owner } = await loadFixture(deployFixture);

    // Act: Mint a new token with a specific metadata URI and then set approval status
    const instance = nftCollection.connect(otherAccount);
    await instance.mint("ipfs://metadatauritoken/1.json");
    await instance.setApprovalForAll(owner.address, false);

    // Assert: Verify that the approval status for the operator (owner) has been correctly updated
    expect(await nftCollection.isApprovedForAll(otherAccount.address, owner.address)).to.equal(false);
  });

  it("should revert when trying to remove marketplace approval", async function () {
    // Arrange: Deploy the contract and get instances of the NFT collection, other account, and marketplace address
    const { nftCollection, otherAccount, marketAddress } = await loadFixture(deployFixture);

    // Act: Connect to the NFT collection as another account and mint a new token
    const instance = nftCollection.connect(otherAccount);
    await instance.mint("ipfs://metadatauritoken/1.json");

    // Assert: Attempt to change approval for the marketplace address and expect the transaction to revert
    await expect(instance.setApprovalForAll(marketAddress, false))
      .to.be.revertedWith("Cannot remove marketplace approval");
  });
});
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("Multitoken", function () {
  async function deployFixture() {
    const [owner, otherAccount] = await ethers.getSigners();

    const Multitoken = await ethers.getContractFactory("Multitoken");
    const contract = await Multitoken.deploy();
    const contractAddress = await contract.getAddress();

    return { contract, contractAddress, owner, otherAccount };
  }

  it("should successfully mint a token and update balance and supply accordingly", async function () {
    const { contract, owner } = await loadFixture(deployFixture);

    // Mint a token with the specified value
    await contract.mint(0, { value: ethers.parseEther("0.01") });

    // Retrieve the updated balance and supply
    const balance = await contract.balanceOf(owner.address, 0);
    const supply = await contract.currentSupply(0);

    // Verify that the balance has been updated correctly
    expect(balance).to.equal(1, "The balance after minting should be 1");

    // Verify that the supply has been updated correctly
    expect(supply).to.equal(49, "The supply after minting should be 49");
  });

  it("should revert when attempting to mint a non-existent token", async function () {
    const { contract } = await loadFixture(deployFixture);

    // Attempt to mint a token with an ID that does not exist
    await expect(contract.mint(3, { value: ethers.parseEther("0.01") }))
      .to.be.revertedWith("This token does not exist");
  });

  it("should revert when the payment amount is insufficient", async function () {
    const { contract } = await loadFixture(deployFixture);

    // Attempt to mint a token with an insufficient payment amount
    await expect(contract.mint(0, { value: ethers.parseEther("0.001") }))
      .to.be.revertedWith("Insufficient payment");
  });

  it("should revert when attempting to mint beyond the maximum supply", async function () {
    const { contract } = await loadFixture(deployFixture);

    // Mint tokens until the maximum supply is reached
    for (let i = 0; i < 50; i++) {
      await contract.mint(0, { value: ethers.parseEther("0.01") });
    }

    // Attempt to mint one more token, which should fail as the maximum supply is reached
    await expect(contract.mint(0, { value: ethers.parseEther("0.01") }))
      .to.be.revertedWith("Max supply reached");
  });

  it("should successfully burn a token and update balance and supply accordingly", async function () {
    const { contract, owner } = await loadFixture(deployFixture);

    // Mint a token to the owner's address
    await contract.mint(0, { value: ethers.parseEther("0.01") });

    // Burn the minted token
    await contract.burn(owner.address, 0, 1);

    // Retrieve the updated balance and supply
    const balance = await contract.balanceOf(owner.address, 0);
    const supply = await contract.currentSupply(0);

    // Verify that the balance is updated correctly after burning
    expect(balance).to.equal(0, "The balance after burning should be 0");

    // Verify that the supply is updated correctly after burning
    expect(supply).to.equal(49, "The supply after burning should be 49");
  });

  it("should allow an approved account to burn a token and update balance and supply accordingly", async function () {
    const { contract, owner, otherAccount } = await loadFixture(deployFixture);

    // Mint a token to the owner's address
    await contract.mint(0, { value: ethers.parseEther("0.01") });

    // Approve `otherAccount` to manage all of the owner's tokens
    await contract.setApprovalForAll(otherAccount.address, true);

    // Verify that `otherAccount` is approved to manage tokens on behalf of `owner`
    const approved = await contract.isApprovedForAll(owner.address, otherAccount.address);
    expect(approved).to.equal(true, "The account should be approved to manage owner's tokens");

    // Connect to the contract as `otherAccount` and burn a token
    const instance = contract.connect(otherAccount);
    await instance.burn(owner.address, 0, 1);

    // Retrieve the updated balance and supply
    const balance = await contract.balanceOf(owner.address, 0);
    const supply = await contract.currentSupply(0);

    // Verify that the balance is updated correctly after burning
    expect(balance).to.equal(0, "The balance after burning by an approved account should be 0");

    // Verify that the supply is updated correctly after burning
    expect(supply).to.equal(49, "The supply after burning by an approved account should be 49");
  });

  it("should revert when attempting to burn more tokens than the balance", async function () {
    const { contract, owner } = await loadFixture(deployFixture);

    // Attempt to burn a token when the owner's balance is zero
    await expect(contract.burn(owner.address, 0, 1))
      .to.be.revertedWithCustomError(contract, "ERC1155InsufficientBalance");
  });

  it("should revert when an account without approval attempts to burn a token", async function () {
    const { contract, owner, otherAccount } = await loadFixture(deployFixture);

    // Mint a token to the owner's address
    await contract.mint(0, { value: ethers.parseEther("0.01") });

    // Connect to the contract as `otherAccount`
    const instance = contract.connect(otherAccount);

    // Attempt to burn a token without having approval to do so
    await expect(instance.burn(owner.address, 0, 1))
      .to.be.revertedWithCustomError(contract, "ERC1155MissingApprovalForAll");
  });

});

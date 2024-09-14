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

  it("should successfully transfer a token using safeTransferFrom and update balances and supply accordingly", async function () {
    const { contract, owner, otherAccount } = await loadFixture(deployFixture);

    // Mint a token to the owner's address
    await contract.mint(0, { value: ethers.parseEther("0.01") });

    // Transfer the minted token from the owner to another account
    await contract.safeTransferFrom(owner.address, otherAccount.address, 0, 1, "0x00000000");

    // Retrieve the updated balances for both addresses and the current supply
    const balances = await contract.balanceOfBatch([owner.address, otherAccount.address], [0, 0]);
    const supply = await contract.currentSupply(0);

    // Verify that the owner's balance is updated correctly after the transfer
    expect(balances[0]).to.equal(0, "The owner's balance should be 0 after the transfer");

    // Verify that the recipient's balance is updated correctly after the transfer
    expect(balances[1]).to.equal(1, "The recipient's balance should be 1 after the transfer");

    // Verify that the supply remains unchanged after the transfer
    expect(supply).to.equal(49, "The supply should remain 49 after the transfer");
  });

  it("should emit a TransferSingle event when a token is transferred", async function () {
    const { contract, owner, otherAccount } = await loadFixture(deployFixture);

    // Mint a token to the owner's address
    await contract.mint(0, { value: ethers.parseEther("0.01") });

    // Expect the TransferSingle event to be emitted with the correct parameters when transferring the token
    await expect(contract.safeTransferFrom(owner.address, otherAccount.address, 0, 1, "0x00000000"))
      .to.emit(contract, "TransferSingle")
      .withArgs(owner.address, owner.address, otherAccount.address, 0, 1);
  });

  it("should successfully transfer multiple tokens in a batch using safeBatchTransferFrom and update balances and supplies accordingly", async function () {
    const { contract, owner, otherAccount } = await loadFixture(deployFixture);

    // Mint tokens to the owner's address
    await contract.mint(0, { value: ethers.parseEther("0.01") });
    await contract.mint(1, { value: ethers.parseEther("0.01") });

    // Perform a batch transfer of tokens from the owner to another account
    await contract.safeBatchTransferFrom(owner.address, otherAccount.address, [0, 1], [1, 1], "0x00000000");

    // Retrieve the updated balances for both addresses and both token types
    const balances = await contract.balanceOfBatch(
      [owner.address, owner.address, otherAccount.address, otherAccount.address],
      [0, 1, 0, 1]
    );
    const supply0 = await contract.currentSupply(0);
    const supply1 = await contract.currentSupply(1);

    // Verify that the owner's balance for token type 0 is updated correctly after the transfer
    expect(balances[0]).to.equal(0, "The owner's balance for token type 0 should be 0 after the batch transfer");

    // Verify that the owner's balance for token type 1 is updated correctly after the transfer
    expect(balances[1]).to.equal(0, "The owner's balance for token type 1 should be 0 after the batch transfer");

    // Verify that the recipient's balance for token type 0 is updated correctly after the transfer
    expect(balances[2]).to.equal(1, "The recipient's balance for token type 0 should be 1 after the batch transfer");

    // Verify that the recipient's balance for token type 1 is updated correctly after the transfer
    expect(balances[3]).to.equal(1, "The recipient's balance for token type 1 should be 1 after the batch transfer");

    // Verify that the supply for token type 0 remains unchanged after the transfer
    expect(supply0).to.equal(49, "The supply for token type 0 should remain 49 after the batch transfer");

    // Verify that the supply for token type 1 remains unchanged after the transfer
    expect(supply1).to.equal(49, "The supply for token type 1 should remain 49 after the batch transfer");
  });

  it("should emit a TransferBatch event with the correct parameters when multiple tokens are transferred", async function () {
    const { contract, owner, otherAccount } = await loadFixture(deployFixture);

    // Mint tokens to the owner's address
    await contract.mint(0, { value: ethers.parseEther("0.01") });
    await contract.mint(1, { value: ethers.parseEther("0.01") });

    // Expect the TransferBatch event to be emitted with the correct parameters when performing a batch transfer
    await expect(contract.safeBatchTransferFrom(owner.address, otherAccount.address, [0, 1], [1, 1], "0x00000000"))
      .to.emit(contract, "TransferBatch")
      .withArgs(
        owner.address,                    // From address
        owner.address,                    // Operator address
        otherAccount.address,             // To address
        [0, 1],                           // Token IDs
        [1, 1]                            // Amounts transferred
      );
  });

  it("should successfully transfer a token using safeTransferFrom and update balances and supply accordingly", async function () {
    const { contract, owner, otherAccount } = await loadFixture(deployFixture);

    // Mint a token to the owner's address
    await contract.mint(0, { value: ethers.parseEther("0.01") });

    // Grant approval for `otherAccount` to manage all tokens of the `owner`
    await contract.setApprovalForAll(otherAccount.address, true);

    // Connect to the contract as `otherAccount` and perform the transfer
    const instance = contract.connect(otherAccount);
    await instance.safeTransferFrom(owner.address, otherAccount.address, 0, 1, "0x00000000");

    // Retrieve the updated balances for both addresses and the current supply
    const balances = await contract.balanceOfBatch([owner.address, otherAccount.address], [0, 0]);
    const supply = await contract.currentSupply(0);

    // Verify that the owner's balance for token type 0 is updated correctly after the transfer
    expect(balances[0]).to.equal(0, "The owner's balance for token type 0 should be 0 after the transfer");

    // Verify that the recipient's balance for token type 0 is updated correctly after the transfer
    expect(balances[1]).to.equal(1, "The recipient's balance for token type 0 should be 1 after the transfer");

    // Verify that the supply for token type 0 remains unchanged after the transfer
    expect(supply).to.equal(49, "The supply for token type 0 should remain 49 after the transfer");
  });

  it("should emit an ApprovalForAll event with the correct parameters when setting approval for all tokens", async function () {
    const { contract, owner, otherAccount } = await loadFixture(deployFixture);

    // Expect the ApprovalForAll event to be emitted with the correct parameters when setting approval for all tokens
    await expect(contract.setApprovalForAll(otherAccount.address, true))
      .to.emit(contract, "ApprovalForAll")
      .withArgs(owner.address, otherAccount.address, true);
  });

  it("should revert with ERC1155InsufficientBalance when attempting to transfer more tokens than available", async function () {
    const { contract, owner, otherAccount } = await loadFixture(deployFixture);

    // Attempt to transfer a token when the owner's balance is insufficient
    await expect(contract.safeTransferFrom(owner.address, otherAccount.address, 0, 1, "0x00000000"))
      .to.be.revertedWithCustomError(contract, "ERC1155InsufficientBalance");
  });

  it("should revert with ERC1155InsufficientBalance when attempting to transfer a token type that does not exist", async function () {
    const { contract, owner, otherAccount } = await loadFixture(deployFixture);

    // Attempt to transfer a token type (ID 10) that does not exist
    await expect(contract.safeTransferFrom(owner.address, otherAccount.address, 10, 1, "0x00000000"))
      .to.be.revertedWithCustomError(contract, "ERC1155InsufficientBalance");
  });

  it("should revert with ERC1155MissingApprovalForAll when attempting to transfer tokens without proper approval", async function () {
    const { contract, owner, otherAccount } = await loadFixture(deployFixture);

    // Mint a token to the owner's address
    await contract.mint(0, { value: ethers.parseEther("0.01") });

    // Connect to the contract as `otherAccount`
    const instance = contract.connect(otherAccount);

    // Attempt to transfer a token from the owner to `otherAccount` without `otherAccount` having the necessary approval
    await expect(instance.safeTransferFrom(owner.address, otherAccount.address, 0, 1, "0x00000000"))
      .to.be.revertedWithCustomError(contract, "ERC1155MissingApprovalForAll");
  });

  it("should revert with ERC1155InvalidArrayLength when the ids and amounts arrays have mismatched lengths in a batch transfer", async function () {
    const { contract, owner, otherAccount } = await loadFixture(deployFixture);

    // Mint tokens to the owner's address
    await contract.mint(0, { value: ethers.parseEther("0.01") });
    await contract.mint(1, { value: ethers.parseEther("0.01") });

    // Attempt to perform a batch transfer with mismatched lengths of ids and amounts arrays
    await expect(contract.safeBatchTransferFrom(owner.address, otherAccount.address, [0, 1], [1], "0x00000000"))
      .to.be.revertedWithCustomError(contract, "ERC1155InvalidArrayLength");
  });

  it("should revert with ERC1155MissingApprovalForAll when attempting a batch transfer without proper approval", async function () {
    const { contract, owner, otherAccount } = await loadFixture(deployFixture);

    // Mint tokens to the owner's address
    await contract.mint(0, { value: ethers.parseEther("0.01") });
    await contract.mint(1, { value: ethers.parseEther("0.01") });

    // Connect to the contract as `otherAccount`
    const instance = contract.connect(otherAccount);

    // Attempt a batch transfer from `owner` to `otherAccount` without `otherAccount` having the necessary approval
    await expect(instance.safeBatchTransferFrom(owner.address, otherAccount.address, [0, 1], [1, 1], "0x00000000"))
      .to.be.revertedWithCustomError(contract, "ERC1155MissingApprovalForAll");
  });

});

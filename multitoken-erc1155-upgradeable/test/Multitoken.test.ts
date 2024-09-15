import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers, upgrades } from "hardhat";
import { Multitoken } from "../typechain-types";

describe("Multitoken", function () {
  async function deployFixture() {
    const [owner, otherAccount] = await ethers.getSigners();

    const Multitoken = await ethers.getContractFactory("Multitoken");
    const contract = await upgrades.deployProxy(Multitoken);
    const contractAddress = await contract.getAddress();

    return { contract, contractAddress, owner, otherAccount };
  }

  it("should successfully mint a token and update the balance", async function () {
    const { contract, owner } = await loadFixture(deployFixture);

    // Mint a token with the specified value
    await contract.mint(0, { value: ethers.parseEther("0.01") });

    // Retrieve the updated balance
    const balance = await contract.balanceOf(owner.address, 0);

    // Verify that the balance has been updated correctly
    expect(balance).to.equal(1, "The balance after minting should be 1");
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

  it("should successfully burn a token and update the balance and supply", async function () {
    const { contract, owner } = await loadFixture(deployFixture);

    // Mint a token to the owner's address
    await contract.mint(0, { value: ethers.parseEther("0.01") });

    // Burn the minted token
    await contract.burn(owner.address, 0, 1);

    // Retrieve the updated balance
    const balance = await contract.balanceOf(owner.address, 0);

    // Verify that the balance is updated correctly after burning
    expect(balance).to.equal(0, "The balance after burning should be 0");
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
    const instance = contract.connect(otherAccount) as Multitoken;
    await instance.burn(owner.address, 0, 1);

    // Retrieve the updated balance and supply
    const balance = await contract.balanceOf(owner.address, 0);

    // Verify that the balance is updated correctly after burning
    expect(balance).to.equal(0, "The balance after burning by an approved account should be 0");
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
    const instance = contract.connect(otherAccount) as Multitoken;

    // Attempt to burn a token without having approval to do so
    await expect(instance.burn(owner.address, 0, 1))
      .to.be.revertedWithCustomError(contract, "ERC1155MissingApprovalForAll");
  });

  it("should successfully transfer a token using safeTransferFrom and update balances accordingly", async function () {
    const { contract, owner, otherAccount } = await loadFixture(deployFixture);

    // Mint a token to the owner's address
    await contract.mint(0, { value: ethers.parseEther("0.01") });

    // Transfer the minted token from the owner to another account
    await contract.safeTransferFrom(owner.address, otherAccount.address, 0, 1, "0x00000000");

    // Retrieve the updated balances for both addresses and the current supply
    const balances = await contract.balanceOfBatch([owner.address, otherAccount.address], [0, 0]);

    // Verify that the owner's balance is updated correctly after the transfer
    expect(balances[0]).to.equal(0, "The owner's balance should be 0 after the transfer");

    // Verify that the recipient's balance is updated correctly after the transfer
    expect(balances[1]).to.equal(1, "The recipient's balance should be 1 after the transfer");
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

    // Verify that the owner's balance for token type 0 is updated correctly after the transfer
    expect(balances[0]).to.equal(0, "The owner's balance for token type 0 should be 0 after the batch transfer");

    // Verify that the owner's balance for token type 1 is updated correctly after the transfer
    expect(balances[1]).to.equal(0, "The owner's balance for token type 1 should be 0 after the batch transfer");

    // Verify that the recipient's balance for token type 0 is updated correctly after the transfer
    expect(balances[2]).to.equal(1, "The recipient's balance for token type 0 should be 1 after the batch transfer");

    // Verify that the recipient's balance for token type 1 is updated correctly after the transfer
    expect(balances[3]).to.equal(1, "The recipient's balance for token type 1 should be 1 after the batch transfer");
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

  it("should successfully transfer a token using safeTransferFrom and update balances accordingly", async function () {
    const { contract, owner, otherAccount } = await loadFixture(deployFixture);

    // Mint a token to the owner's address
    await contract.mint(0, { value: ethers.parseEther("0.01") });

    // Grant approval for `otherAccount` to manage all tokens of the `owner`
    await contract.setApprovalForAll(otherAccount.address, true);

    // Connect to the contract as `otherAccount` and perform the transfer
    const instance = contract.connect(otherAccount) as Multitoken;
    await instance.safeTransferFrom(owner.address, otherAccount.address, 0, 1, "0x00000000");

    // Retrieve the updated balances for both addresses and the current supply
    const balances = await contract.balanceOfBatch([owner.address, otherAccount.address], [0, 0]);

    // Verify that the owner's balance for token type 0 is updated correctly after the transfer
    expect(balances[0]).to.equal(0, "The owner's balance for token type 0 should be 0 after the transfer");

    // Verify that the recipient's balance for token type 0 is updated correctly after the transfer
    expect(balances[1]).to.equal(1, "The recipient's balance for token type 0 should be 1 after the transfer");
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
    const instance = contract.connect(otherAccount) as Multitoken;

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
    const instance = contract.connect(otherAccount) as Multitoken;

    // Attempt a batch transfer from `owner` to `otherAccount` without `otherAccount` having the necessary approval
    await expect(instance.safeBatchTransferFrom(owner.address, otherAccount.address, [0, 1], [1, 1], "0x00000000"))
      .to.be.revertedWithCustomError(contract, "ERC1155MissingApprovalForAll");
  });

  it("should support the ERC-1155 interface", async function () {
    const { contract } = await loadFixture(deployFixture);

    // The ERC-1155 interface ID (0xd9b67a26) should be supported
    const supportsERC1155 = await contract.supportsInterface("0xd9b67a26");

    // Verify that the contract correctly reports support for the ERC-1155 interface
    expect(supportsERC1155).to.equal(true, "The contract does not support the ERC-1155 interface");
  });

  it("should correctly withdraw funds from the contract", async function () {
    const { contract, contractAddress, owner, otherAccount } = await loadFixture(deployFixture);

    // Connect to the contract as `otherAccount` and mint a token to trigger a deposit
    const instance = contract.connect(otherAccount) as Multitoken;
    await instance.mint(0, { value: ethers.parseEther("0.01") });

    // Check the contract's and owner's balance before the withdrawal
    const contractBalanceBefore = await ethers.provider.getBalance(contractAddress);
    const ownerBalanceBefore = await ethers.provider.getBalance(owner.address);

    // Perform the withdrawal from the contract
    await contract.withdraw();

    // Check the contract's and owner's balance after the withdrawal
    const contractBalanceAfter = await ethers.provider.getBalance(contractAddress);
    const ownerBalanceAfter = await ethers.provider.getBalance(owner.address);

    // Verify the contract's balance is zero after the withdrawal
    expect(contractBalanceAfter).to.equal(0, "The contract balance should be zero after withdrawal");

    // Verify the contract balance was correctly withdrawn (initial balance minus amount withdrawn)
    expect(contractBalanceBefore).to.equal(ethers.parseEther("0.01"), "The contract balance before withdrawal is incorrect");

    // Verify the owner's balance has increased by the withdrawn amount
    expect(ownerBalanceAfter).to.be.greaterThan(ownerBalanceBefore, "The owner's balance should increase after withdrawal");
  });

  it("should revert with 'OwnableUnauthorizedAccount' when an unauthorized account attempts to withdraw funds", async function () {
    const { contract, otherAccount } = await loadFixture(deployFixture);

    // Connect to the contract as `otherAccount`, who should not have permission to withdraw
    const instance = contract.connect(otherAccount) as Multitoken;

    // Attempt to perform the withdrawal from an unauthorized account
    await expect(instance.withdraw())
      .to.be.revertedWithCustomError(contract, "OwnableUnauthorizedAccount");
  });

  it("should return the correct URI for the token metadata", async function () {
    const { contract } = await loadFixture(deployFixture);

    // Mint a token to trigger the URI setup
    await contract.mint(0, { value: ethers.parseEther("0.01") });

    // Retrieve the URI for token ID 0
    const uri = await contract.uri(0);

    // Verify that the URI matches the expected value
    expect(uri).to.equal("https://examplemultitoken.com/tokens/0.json", "The URI for token ID 0 is incorrect");
  });

  it("should revert with 'This token does not exist' when requesting URI metadata for a non-existent token", async function () {
    const { contract } = await loadFixture(deployFixture);

    // Attempt to retrieve the URI for a token ID that does not exist
    await expect(contract.uri(10))
      .to.be.revertedWith("This token does not exist");
  });
});

import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("ProtoNFT", () => {
  async function deployFixture() {
    const [owner, otherAccount] = await ethers.getSigners();

    const ProtoNFT = await ethers.getContractFactory("ProtoNFT");
    const contract = await ProtoNFT.deploy();

    return { contract, owner, otherAccount };
  }

  it("Should has name", async () => {
    const { contract } = await loadFixture(deployFixture);
    expect(await contract.name())
      .to.equal("ProtoNFT", "Can't get name");
  });

  it("Should has symbol", async () => {
    const { contract } = await loadFixture(deployFixture);
    expect(await contract.symbol())
      .to.equal("PNFT", "Can't get symbol");
  });

  it("Should mint", async () => {
    const { contract, owner } = await loadFixture(deployFixture);

    await contract.mint();

    const balance = await contract.balanceOf(owner.address);
    const tokenId = await contract.tokenByIndex(0);
    const ownerOf = await contract.ownerOf(tokenId);
    const ownerTokenId = await contract.tokenOfOwnerByIndex(owner.address, 0);
    const totalSupply = await contract.totalSupply();

    expect(balance).to.equal(1, "Can't mint (balance)");
    expect(tokenId).to.equal(ownerTokenId, "Can't mint (tokenId)");
    expect(ownerOf).to.equal(owner.address, "Can't mint (ownerOf)");
    expect(totalSupply).to.equal(1, "Can't mint (totalSupply)");
  });

  it("Should burn", async () => {
    const { contract, owner } = await loadFixture(deployFixture);

    await contract.mint();
    const tokenId = await contract.tokenByIndex(0);

    await contract.burn(tokenId);

    const balance = await contract.balanceOf(owner.address);
    const totalSupply = await contract.totalSupply();

    expect(balance).to.equal(0, "Can't burn (balance)");
    expect(totalSupply).to.equal(0, "Can't burn (totalSupply)");
  });

  it("Should burn (approved)", async () => {
    const { contract, owner, otherAccount } = await loadFixture(deployFixture);

    await contract.mint();
    const tokenId = await contract.tokenByIndex(0);

    await contract.approve(otherAccount.address, tokenId);
    const approved = await contract.getApproved(tokenId);

    const instance = contract.connect(otherAccount);
    await instance.burn(tokenId);

    const balance = await contract.balanceOf(owner.address);
    const totalSupply = await contract.totalSupply();

    expect(balance).to.equal(0, "Can't burn (approve | balance)");
    expect(totalSupply).to.equal(0, "Can't burn (approve | totalSupply)");
    expect(approved).to.equal(otherAccount.address, "Can't burn (approved)");
  });

  it("Should burn (approved for all)", async () => {
    const { contract, owner, otherAccount } = await loadFixture(deployFixture);

    await contract.mint();
    const tokenId = await contract.tokenByIndex(0);

    await contract.setApprovalForAll(otherAccount.address, true);
    const approved = await contract.isApprovedForAll(owner.address, otherAccount.address);

    const instance = contract.connect(otherAccount);
    await instance.burn(tokenId);

    const balance = await contract.balanceOf(owner.address);
    const totalSupply = await contract.totalSupply();

    expect(balance).to.equal(0, "Can't burn (approve for all | balance)");
    expect(approved).to.equal(true, "Can't burn (approve for all | approved)");
    expect(totalSupply).to.equal(0, "Can't burn (approve for all | totalSupply)");
  });

  it("Should NOT burn (not exists)", async () => {
    const { contract } = await loadFixture(deployFixture);
    await expect(contract.burn(1))
      .to.be.revertedWithCustomError(contract, "ERC721NonexistentToken");
  });

  it("Should NOT burn (permission)", async () => {
    const { contract, otherAccount } = await loadFixture(deployFixture);

    await contract.mint();
    const tokenId = await contract.tokenByIndex(0);
    const instance = contract.connect(otherAccount);

    await expect(instance.burn(tokenId))
      .to.be.revertedWithCustomError(contract, "ERC721InsufficientApproval");
  });

  it("Should has URI metadata", async () => {
    const { contract } = await loadFixture(deployFixture);

    await contract.mint();
    const tokenId = await contract.tokenByIndex(0);

    expect(await contract.tokenURI(tokenId))
      .to.equal("https://www.protonft.example.com/nfts/1.json", "Can't get URI Metadata");
  });

  it("Should NOT has URI metadata", async () => {
    const { contract } = await loadFixture(deployFixture);
    await expect(contract.tokenURI(1))
      .to.be.revertedWithCustomError(contract, "ERC721NonexistentToken");
  });

  it("Should transfer", async () => {
    const { contract, owner, otherAccount } = await loadFixture(deployFixture);

    await contract.mint();

    const tokenId = await contract.tokenByIndex(0);
    await contract.transferFrom(owner.address, otherAccount.address, tokenId);

    const balanceFrom = await contract.balanceOf(owner.address);
    const balanceTo = await contract.balanceOf(otherAccount.address);
    const ownerOf = await contract.ownerOf(tokenId);
    const ownerTokenId = await contract.tokenOfOwnerByIndex(otherAccount.address, 0);

    expect(balanceFrom).to.equal(0, "Can't transfer (balanceFrom)");
    expect(balanceTo).to.equal(1, "Can't transfer (balanceTo)");
    expect(ownerOf).to.equal(otherAccount.address, "Can't transfer (ownerOf)");
    expect(tokenId).to.equal(ownerTokenId, "Can't transfer (tokenId)");
  });

  it("Should emit transfer", async () => {
    const { contract, owner, otherAccount } = await loadFixture(deployFixture);

    await contract.mint();
    const tokenId = await contract.tokenByIndex(0);

    await expect(contract.transferFrom(owner.address, otherAccount.address, tokenId))
      .to.emit(contract, "Transfer")
      .withArgs(owner.address, otherAccount.address, tokenId);
  });

  it("Should transfer (approved)", async () => {
    const { contract, owner, otherAccount } = await loadFixture(deployFixture);

    await contract.mint();
    const tokenId = await contract.tokenByIndex(0);

    await contract.approve(otherAccount.address, tokenId);
    const approved = await contract.getApproved(tokenId);

    const instance = contract.connect(otherAccount);
    await instance.transferFrom(owner.address, otherAccount.address, tokenId);

    const ownerOf = await contract.ownerOf(tokenId);

    expect(ownerOf).to.equal(otherAccount.address, "Can't transfer (approved | ownerOf)");
    expect(approved).to.equal(otherAccount.address, "Can't transfer (approved)");
  });

  it("Should emit approval", async () => {
    const { contract, owner, otherAccount } = await loadFixture(deployFixture);

    await contract.mint();
    const tokenId = await contract.tokenByIndex(0);

    await expect(contract.approve(otherAccount.address, tokenId))
      .to.emit(contract, "Approval")
      .withArgs(owner.address, otherAccount.address, tokenId);
  });

  it("Should clear approvals", async () => {
    const { contract, owner, otherAccount } = await loadFixture(deployFixture);

    await contract.mint();
    const tokenId = await contract.tokenByIndex(0);

    await contract.approve(otherAccount.address, tokenId);
    await contract.transferFrom(owner.address, otherAccount.address, tokenId);
    const approved = await contract.getApproved(tokenId);

    expect(approved).to.equal(ethers.ZeroAddress, "Can't clear approval");
  });

  it("Should transfer (approve for all)", async () => {
    const { contract, owner, otherAccount } = await loadFixture(deployFixture);

    await contract.mint();
    const tokenId = await contract.tokenByIndex(0);

    await contract.setApprovalForAll(otherAccount.address, true);
    const approved = await contract.isApprovedForAll(owner.address, otherAccount.address);

    const instance = contract.connect(otherAccount);
    await instance.transferFrom(owner.address, otherAccount.address, tokenId);

    const ownerOf = await contract.ownerOf(tokenId);

    expect(ownerOf).to.equal(otherAccount.address, "Can't transfer (ownerOf)");
    expect(approved).to.equal(true, "Can't transfer (approved)");
  });

  it("Should emit approval for all", async () => {
    const { contract, owner, otherAccount } = await loadFixture(deployFixture);

    await contract.mint();

    await expect(contract.setApprovalForAll(otherAccount.address, true))
      .to.emit(contract, "ApprovalForAll")
      .withArgs(owner.address, otherAccount.address, true);
  });

  it("Should NOT transfer (permission)", async () => {
    const { contract, owner, otherAccount } = await loadFixture(deployFixture);

    await contract.mint();
    const tokenId = await contract.tokenByIndex(0);

    const instance = contract.connect(otherAccount);

    await expect(instance.transferFrom(owner.address, otherAccount.address, tokenId))
      .to.be.revertedWithCustomError(contract, "ERC721InsufficientApproval");
  });

  it("Should NOT transfer (exists)", async () => {
    const { contract, owner, otherAccount } = await loadFixture(deployFixture);

    await expect(contract.transferFrom(owner.address, otherAccount.address, 1))
      .to.be.revertedWithCustomError(contract, "ERC721NonexistentToken");
  });

  it("Should supports interface", async () => {
    const { contract } = await loadFixture(deployFixture);

    expect(await contract.supportsInterface("0x80ac58cd"))
      .to.equal(true, "Can't support interface");
  });
});
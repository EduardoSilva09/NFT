import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("NFT Market", function () {
  async function deployFixture() {
    const [owner, otherAccount] = await ethers.getSigners();

    const NFTMarket = await ethers.getContractFactory("NFTMarket");
    const nftMarket = await NFTMarket.deploy();
    const marketAddress = await nftMarket.getAddress();

    const NFTCollection = await ethers.getContractFactory("NFTCollection");
    const nftCollection = await NFTCollection.deploy(marketAddress);
    const collectionAddress = await nftCollection.getAddress();

    return { nftMarket, marketAddress, nftCollection, collectionAddress, owner, otherAccount };
  }

  it("should correctly fetch market items after creating a market item", async function () {
    const { nftMarket, collectionAddress, nftCollection } = await loadFixture(deployFixture);

    // Arrange: Define listing and auction prices
    const listingPrice = (await nftMarket.listingPrice()).toString();
    const auctionPrice = ethers.parseUnits("1", "ether");

    // Act: Mint a new NFT and create a market item with it
    await nftCollection.mint("metadata uri");
    await nftMarket.createMarketItem(collectionAddress, 1, auctionPrice, { value: listingPrice });

    // Act: Fetch the list of market items
    const marketItems = await nftMarket.fetchMarketItems();

    // Assert: Verify that the fetched market items contain the newly created item
    expect(marketItems.length).to.equal(1);
    expect(marketItems[0].tokenId).to.equal(1);
    expect(marketItems[0].price.toString()).to.equal(auctionPrice.toString());
    expect(marketItems[0].nftContract).to.equal(collectionAddress);
    expect(marketItems[0].sold).to.be.false;
  });

  it("should correctly fetch the NFTs owned by the caller after a purchase", async function () {
    const { nftMarket, nftCollection, collectionAddress, otherAccount } = await loadFixture(deployFixture);

    // Arrange: Define listing and auction prices
    const listingPrice = (await nftMarket.listingPrice()).toString();
    const auctionPrice = ethers.parseUnits("1", "ether");

    // Act: Mint two new NFTs
    await nftCollection.mint("metadata uri");
    await nftCollection.mint("metadata uri2");

    // Act: Create two market items with the minted NFTs
    await nftMarket.createMarketItem(collectionAddress, 1, auctionPrice, { value: listingPrice });
    await nftMarket.createMarketItem(collectionAddress, 2, auctionPrice, { value: listingPrice });

    // Act: Connect as another account and purchase one of the market items
    const instance = nftMarket.connect(otherAccount);
    await instance.createMarketSale(collectionAddress, 2, { value: auctionPrice });

    // Act: Fetch the NFTs owned by the other account
    const myNFTs = await instance.fetchMyNFTs();

    // Assert: Verify that only the purchased NFT is returned
    expect(myNFTs.length).to.equal(1);
    expect(myNFTs[0].itemId).to.equal(2);
    expect(myNFTs[0].nftContract).to.equal(collectionAddress);
    expect(myNFTs[0].owner).to.equal(otherAccount.address);
    expect(myNFTs[0].price.toString()).to.equal(auctionPrice.toString());
    expect(myNFTs[0].sold).to.be.true;
  });

  it("Should fetch my created items", async function () {
    const { nftMarket, nftCollection, collectionAddress } = await loadFixture(deployFixture);

    // Arrange: Define listing and auction prices
    const listingPrice = (await nftMarket.listingPrice()).toString();
    const auctionPrice = ethers.parseUnits("1", "ether");

    // Act: Mint two new NFTs
    await nftCollection.mint("metadata uri");
    await nftCollection.mint("metadata uri2");

    // Act: Create two market items with the minted NFTs
    await nftMarket.createMarketItem(collectionAddress, 1, auctionPrice, { value: listingPrice });
    await nftMarket.createMarketItem(collectionAddress, 2, auctionPrice, { value: listingPrice });

    // Act: Fetch the items created by the caller
    const createdItems = await nftMarket.fetchItemsCreated();

    // Assert: Verify that the fetched items are the ones created by the caller
    expect(createdItems.length).to.equal(2);

    // Additional assertions to verify the details of the created items
    expect(createdItems[0].itemId).to.equal(1);
    expect(createdItems[1].itemId).to.equal(2);
    expect(createdItems[0].nftContract).to.equal(collectionAddress);
    expect(createdItems[1].nftContract).to.equal(collectionAddress);
    expect(createdItems[0].price.toString()).to.equal(auctionPrice.toString());
    expect(createdItems[1].price.toString()).to.equal(auctionPrice.toString());
    expect(createdItems[0].sold).to.be.false;
    expect(createdItems[1].sold).to.be.false;
  });

  it("should correctly handle creating and executing a market sale", async function () {
    const { nftMarket, nftCollection, collectionAddress, otherAccount } = await loadFixture(deployFixture);

    // Arrange: Define listing and auction prices
    const listingPrice = (await nftMarket.listingPrice()).toString();
    const auctionPrice = ethers.parseUnits("1", "ether");

    // Act: Mint a new NFT and create a market item with it
    await nftCollection.mint("metadata uri");
    await nftMarket.createMarketItem(collectionAddress, 1, auctionPrice, { value: listingPrice });

    // Act: Connect as another account and purchase the market item
    const instance = nftMarket.connect(otherAccount);
    await instance.createMarketSale(collectionAddress, 1, { value: auctionPrice });

    // Assert: Verify that the ownership of the NFT has transferred to the other account
    const nftOwner = await nftCollection.ownerOf(1);
    expect(nftOwner).to.equal(otherAccount.address);

    // Assert: Verify that the market item has been removed from the list of market items
    const marketItems = await nftMarket.fetchMarketItems();
    expect(marketItems.length).to.equal(0);

    // Additional assertions to verify that the item is marked as sold
    const createdItems = await nftMarket.fetchItemsCreated();
    expect(createdItems.length).to.equal(1);
    expect(createdItems[0].sold).to.be.true;
  });

  it("should revert if the price is zero", async function () {
    const { nftMarket, nftCollection, collectionAddress } = await loadFixture(deployFixture);
    // Arrange: Approve the NFT for transfer to the nftMarket contract
    await nftCollection.mint("metadata uri");

    // Arrange: Define listing 
    const listingPrice = (await nftMarket.listingPrice()).toString();

    // Act & Assert: Attempt to create a market item with a price of zero
    await expect(
      nftMarket.createMarketItem(collectionAddress, 1, 0, { value: listingPrice })
    ).to.be.revertedWith("Price cannot be zero");
  });

  it("should revert when creating a market item with a value less than the listing price", async function () {
    // Arrange: Deploy contracts and mint an NFT
    const { nftMarket, nftCollection, collectionAddress } = await loadFixture(deployFixture);
    await nftCollection.mint("metadata uri");

    // Arrange: Define incorrect value (less than the required listingPrice)
    const incorrectValue = ethers.parseUnits("0.05", "ether");
    const correctPrice = ethers.parseUnits("1", "ether");

    // Act & Assert: Attempt to create a market item with an incorrect value
    await expect(
      nftMarket.createMarketItem(collectionAddress, 1, correctPrice, { value: incorrectValue })
    ).to.be.revertedWith("Value must be equal listing price");
  });

  it("should revert when purchasing a market item with a value different from the asking price", async function () {
    const { nftMarket, nftCollection, collectionAddress, otherAccount } = await loadFixture(deployFixture);
    // Arrange: Mint an NFT with a specific metadata URI
    await nftCollection.mint("metadata uri");

    // Arrange: Define listing price and auction price
    const listingPrice = await nftMarket.listingPrice();
    const auctionPrice = ethers.parseUnits("1", "ether");

    // Arrange: Create a market item with the minted NFT, setting the auction price
    await nftMarket.createMarketItem(collectionAddress, 1, auctionPrice, { value: listingPrice });

    // Act: Attempt to buy the market item with an incorrect value
    const incorrectValue = ethers.parseUnits("0.5", "ether");

    // Assert: Ensure that the transaction reverts with the expected error message
    await expect(
      nftMarket.connect(otherAccount).createMarketSale(collectionAddress, 1, { value: incorrectValue })
    ).to.be.revertedWith("Please submit the asking price in order to complete purchase");
  });
});
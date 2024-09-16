// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract NFTMarket is ReentrancyGuard {
    address payable owner;
    uint public listingPrice = 0.025 ether;
    uint private _itemIds;
    uint private _itemsSold;

    constructor() {
        owner = payable(msg.sender);
    }

    struct MarketItem {
        uint itemId;
        address nftContract;
        uint tokenId;
        address payable seller;
        address payable owner;
        uint price;
        bool sold;
    }

    mapping(uint => MarketItem) public marketItems; // item id => market item
    event MarketItemCreated(
        uint indexed itemId,
        address indexed nftContract,
        uint indexed tokenId,
        address seller,
        uint price
    );
    /**
     * @dev Creates a new market item for sale.
     *
     * This function allows a user to list their NFT (non-fungible token) for sale in the market.
     * It requires a price and a listing fee to be sent with the transaction.
     * The function updates the market item details and transfers the NFT from the seller to the contract.
     *
     * @param nftContract The address of the NFT contract that adheres to the ERC721 standard.
     * @param tokenId The unique identifier of the NFT being listed.
     * @param price The price at which the NFT is listed for sale, in wei.
     *
     * Emits a {MarketItemCreated} event indicating the creation of a new market item.
     *
     * Requirements:
     * - `price` must be greater than zero.
     * - The value sent with the transaction (`msg.value`) must be equal to the `listingPrice`.
     *
     * Reverts if:
     * - `price` is zero.
     * - `msg.value` is not equal to the `listingPrice`.
     *
     * Uses the `nonReentrant` modifier to prevent reentrant calls to this function.
     */
    function createMarketItem(
        address nftContract,
        uint tokenId,
        uint price
    ) public payable nonReentrant {
        require(price > 0, "Price cannot be zero");
        require(
            msg.value == listingPrice,
            "Value muste be equal listing price"
        );
        _itemIds++;
        uint itemId = _itemIds;
        marketItems[itemId] = MarketItem(
            itemId,
            nftContract,
            tokenId,
            payable(msg.sender),
            payable(address(0)),
            price,
            false
        );

        IERC721(nftContract).transferFrom(msg.sender, address(this), tokenId);
        emit MarketItemCreated(itemId, nftContract, tokenId, msg.sender, price);
    }
    /**
     * @dev Completes the purchase of a market item.
     *
     * This function allows a user to buy an NFT listed on the market by paying the specified price.
     * It transfers the payment to the seller, the NFT to the buyer, and updates the market item status
     * to reflect the new ownership and mark it as sold.
     *
     * @param nftContract The address of the NFT contract that adheres to the ERC721 standard.
     * @param itemId The unique identifier of the market item being purchased.
     *
     * Emits:
     * - A transfer event from the contract to the buyer (implicitly handled by the ERC721 `transferFrom` function).
     *
     * Requirements:
     * - The value sent with the transaction (`msg.value`) must be equal to the price of the item.
     *
     * Reverts if:
     * - The transaction value does not match the item's price.
     *
     * Uses the `nonReentrant` modifier to prevent reentrant calls to this function.
     */
    function createMarketSale(
        address nftContract,
        uint itemId
    ) public payable nonReentrant {
        uint price = marketItems[itemId].price;
        uint tokenId = marketItems[itemId].tokenId;

        require(
            msg.value == price,
            "Please submit the asking price in order to complete purchase"
        );

        // Transfer the payment to the seller of the item.
        marketItems[itemId].seller.transfer(msg.value);

        // Transfer the NFT from the contract (market) to the buyer (msg.sender).
        IERC721(nftContract).transferFrom(address(this), msg.sender, tokenId);

        // Update the marketItems mapping to reflect the new owner of the item and mark it as sold.
        marketItems[itemId].owner = payable(msg.sender);
        marketItems[itemId].sold = true;

        _itemsSold++;
        payable(owner).transfer(listingPrice);
    }
    /**
     * @dev Fetches all unsold market items.
     *
     * This function returns an array of `MarketItem` structures that are currently unsold and available
     * for purchase on the market. It filters out items that have been sold or have a non-zero owner
     * address, and only includes items that are still available.
     *
     * @return An array of `MarketItem` structures representing the unsold market items.
     *
     */
    function fetchMarketItems() public view returns (MarketItem[] memory) {
        uint totalItemCount = _itemIds;
        uint unsoldItemCount = totalItemCount - _itemsSold;

        MarketItem[] memory items = new MarketItem[](unsoldItemCount);
        uint currentIndex = 0;

        for (uint i = 1; i <= totalItemCount; ++i) {
            if (marketItems[i].owner == address(0) && !marketItems[i].sold) {
                items[currentIndex] = marketItems[i];
                ++currentIndex;
            }
        }

        return items;
    }
    /**
     * @dev Fetches all NFTs owned by the caller.
     *
     * This function returns an array of `MarketItem` structures that are owned by the address
     * of the caller (`msg.sender`). It filters items to include only those where the `owner`
     * address matches the caller's address.
     *
     * @return An array of `MarketItem` structures representing the NFTs owned by the caller.
     *
     */
    function fetchMyNFTs() public view returns (MarketItem[] memory) {
        uint totalItemCount = _itemIds;
        uint itemCount = 0;

        for (uint i = 1; i <= totalItemCount; ++i) {
            if (marketItems[i].owner == msg.sender) {
                ++itemCount;
            }
        }

        MarketItem[] memory items = new MarketItem[](itemCount);
        uint currentIndex = 0;

        for (uint i = 1; i <= totalItemCount; ++i) {
            if (marketItems[i].owner == msg.sender) {
                items[currentIndex] = marketItems[i];
                ++currentIndex;
            }
        }

        return items;
    }
    /**
     * @dev Fetches all market items created by the caller.
     *
     * This function returns an array of `MarketItem` structures that were created by the address
     * of the caller (`msg.sender`). It filters items to include only those where the `seller`
     * address matches the caller's address.
     *
     * @return An array of `MarketItem` structures representing the market items created by the caller.
     *
     */
    function fetchItemsCreated() public view returns (MarketItem[] memory) {
        uint totalItemCount = _itemIds;
        uint itemCount = 0;

        for (uint i = 1; i <= totalItemCount; ++i) {
            if (marketItems[i].seller == msg.sender) {
                ++itemCount;
            }
        }

        MarketItem[] memory items = new MarketItem[](itemCount);
        uint currentIndex = 0;

        for (uint i = 1; i <= totalItemCount; ++i) {
            if (marketItems[i].seller == msg.sender) {
                items[currentIndex] = marketItems[i];
                ++currentIndex;
            }
        }

        return items;
    }
}

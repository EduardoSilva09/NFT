// SPDX-License-Identifier: UNLICENSED
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
}

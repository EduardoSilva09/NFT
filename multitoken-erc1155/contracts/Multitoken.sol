// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Burnable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract Multitoken is ERC1155, ERC1155Burnable {
    uint256 private constant NFT_1 = 0;
    uint256 private constant NFT_2 = 1;
    uint256 private constant NFT_3 = 2;
    uint256 public tokenPrice = 0.01 ether;
    address payable public immutable owner;
    uint256[] public currentSupply = [50, 50, 50];

    string public constant BASE_URL = "https://examplemultitoken.com/tokens/";

    constructor() ERC1155(BASE_URL) {
        owner = payable(msg.sender);
    }

    function mint(uint256 id) external payable {
        require(id < 3, "This token does not exist");
        require(currentSupply[id] > 0, "Max supply reached");
        require(msg.value >= tokenPrice, "Insufficient payment");
        _mint(msg.sender, id, 1, "");
        currentSupply[id]--;
    }

    function uri(uint256 id) public pure override returns (string memory) {
        require(id < 3, "This token does not exist");
        return string.concat(BASE_URL, Strings.toString(id), ".json");
    }

    function withdraw() external {
        require(msg.sender == owner, "You do not have permission");
        uint256 amount = address(this).balance;
        (bool success, ) = owner.call{value: amount}("");
        require(success == true, "Failed to withdraw");
    }
}

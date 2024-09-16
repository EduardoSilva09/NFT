// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract NFTCollection is ERC721URIStorage {
    uint256 private _tokenIds;
    address internal contractAddress; //marketplace
    address internal owner;

    constructor(address marketplaceAddress) ERC721("OpenC", "OPC") {
        contractAddress = marketplaceAddress;
        owner = msg.sender;
    }
    /**
     * @dev Mints a new NFT and assigns it to the caller.
     *
     * This function creates a new NFT with a unique token ID and assigns it to the address of the caller (`msg.sender`).
     * It also sets the token's URI and grants approval for the contract to manage the newly minted token.
     *
     * @param uri The metadata URI of the NFT, which typically points to a JSON file containing metadata such as name, description, and image URL.
     *
     * @return tokenId The unique identifier of the newly minted NFT.
     *
     * Requirements:
     * - The caller must have a valid address.
     */
    function mint(string memory uri) public returns (uint) {
        uint tokenId = ++_tokenIds;

        _mint(msg.sender, tokenId);
        _setTokenURI(tokenId, uri);
        setApprovalForAll(contractAddress, true);

        return tokenId;
    }
    /**
     * @dev Sets or revokes approval for an operator to manage all of the caller's tokens.
     *
     * This function allows the caller (token owner) to set or revoke approval for a specified operator
     * to manage all of their tokens. It includes a restriction to prevent the removal of approval for
     * a marketplace contract if it is set to true.
     *
     * @param operator The address of the operator to be approved or disapproved.
     * @param approved A boolean value indicating whether the operator is approved (`true`) or not (`false`).
     *
     * Requirements:
     * - The caller must be the owner of the tokens or the contract.
     * - If the `operator` is the marketplace contract address and `approved` is `false`, the call will revert
     *   with the message "Cannot remove marketplace approval".
     *
     * This function overrides the `setApprovalForAll` method from both `ERC721` and `IERC721`.
     *
     * Emits an {ApprovalForAll} event indicating the change in approval status for the specified operator.
     */
    function setApprovalForAll(
        address operator,
        bool approved
    ) public virtual override(ERC721, IERC721) {
        require(
            _msgSender() == owner || operator != contractAddress || approved,
            "Cannot remove marketplace approval"
        );
        _setApprovalForAll(_msgSender(), operator, approved);
    }
}

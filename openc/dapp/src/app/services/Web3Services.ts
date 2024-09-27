import axios from "axios";
import { ethers, EventLog } from "ethers";
import NFTMarketABI from "./NFTMarket.abi.json";
import NFTCollectionABI from "./NFTCollection.abi.json";

const MARKETPLACE_ADDRESS = `${process.env.MARKETPLACE_ADDRESS}`;
const COLLECTION_ADDRESS = `${process.env.COLLECTION_ADDRESS}`;
const CHAIN_ID = `${process.env.CHAIN_ID}`;

export type NFT = {
  itemId: number;
  tokenId: number;
  price: bigint | string;
  seller: string;
  owner: string;
  image: string;
  name: string;
  description: string;
}

export type NewNFT = {
  name?: string;
  description?: string;
  price?: string;
  image?: File;
}

type Metadata = {
  name?: string;
  description?: string;
  image?: string;
}

async function getProvider() {
  if (!window.ethereum) throw new Error(`Wallet not found!`);
  const provider = new ethers.BrowserProvider(window.ethereum);
  const accounts: string[] = await provider.send("eth_requestAccounts", []);
  if (!accounts || !accounts.length) throw new Error(`Wallet not permitted!`);
  await provider.send("wallet_switchEthereumChain", [{ chainId: CHAIN_ID }]);
  return provider;
}

async function createItem(url: string, price: string): Promise<number> {
  const provider = await getProvider();
  const signer = await provider.getSigner();

  const collectionContract = new ethers.Contract(COLLECTION_ADDRESS, NFTCollectionABI, signer);
  const mintTx = await collectionContract.mint(url);
  // Get the tokenId from the tx log
  const mintTxReceipt: ethers.ContractTransactionReceipt = await mintTx.wait();
  let eventLog = mintTxReceipt.logs[0] as EventLog;//Transfer event
  const tokenId = Number(eventLog.args[2]);//Param _tokenId from Transfer event

  //Create market item
  const weiPrice = ethers.parseUnits(price, "ether");
  const marketContract = new ethers.Contract(MARKETPLACE_ADDRESS, NFTMarketABI, signer);
  const listingPrice = (await marketContract.listingPrice()).toString();
  const createTx = await marketContract.createMarketItem(COLLECTION_ADDRESS, tokenId, weiPrice, { value: listingPrice });
  const createTxReceipt: ethers.ContractTransactionReceipt = await createTx.wait();

  eventLog = createTxReceipt.logs.find(l => (l as EventLog).eventName === "MarketItemCreated") as EventLog;
  const itemId = Number(eventLog.args[0]);
  return itemId;
}

async function uploadFile(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await axios({
    method: "POST",
    url: "/pinata/file",
    data: formData,
    headers: { "Content-Type": "multipart/form-data" }
  })

  return `${response.data.uri}`;
}

async function uploadMetadata(metadata: Metadata) {
  const response = await axios({
    method: "POST",
    url: "/pinata/metadata",
    data: metadata,
    headers: { "Content-Type": "application/json" }
  })

  return `${response.data.uri}`;
}

export async function uploadAndCreate(nft: NewNFT): Promise<number> {

  if (!nft.name || !nft.description || !nft.image || !nft.price)
    throw new Error("All fields are required.");

  const uri = await uploadFile(nft.image);
  const metadataUri = await uploadMetadata({ name: nft.name, description: nft.description, image: uri });
  console.log(metadataUri);
  const itemId = await createItem(metadataUri, nft.price);
  return itemId;
}

/**
 * Initiates the purchase of a specified NFT.
 *
 * @param {NFT} nft - The NFT object containing details of the item to be purchased.
 * @property {string} nft.price - The price of the NFT in Ether.
 * @property {string} nft.itemId - The unique identifier for the NFT within the collection.
 *
 * @returns {Promise<void>} - A promise that resolves when the transaction is confirmed.
 *
 * @throws {Error} - Throws an error if the transaction fails or if the provider is not available.
 */
export async function buyNFT(nft: NFT) {
  const provider = await getProvider();
  const signer = await provider.getSigner();
  const contract = new ethers.Contract(MARKETPLACE_ADDRESS, NFTMarketABI, signer);
  const price = ethers.parseUnits(nft.price.toString(), "ether");
  const tx = await contract.createMarketSale(COLLECTION_ADDRESS, nft.itemId, { value: price });
  await tx.wait();
}

/**
 * Fetches the details of an NFT from the marketplace.
 *
 * @param {number} itemId - The unique identifier of the NFT in the marketplace.
 * @returns {Promise<NFT>} A promise that resolves to an object containing the NFT details.
 * 
 * @throws {Error} Throws an error if the network request fails or if the item cannot be found.
 *
 */
export async function loadDetails(itemId: number): Promise<NFT> {
  const provider = await getProvider();
  const marketContract = new ethers.Contract(MARKETPLACE_ADDRESS, NFTMarketABI, provider);
  const collectionContract = new ethers.Contract(COLLECTION_ADDRESS, NFTCollectionABI, provider);
  const item: NFT = await marketContract.marketItems(itemId);

  if (!item)
    return {} as NFT;

  const tokenUri = await collectionContract.tokenURI(item.tokenId);
  const metadata = await axios.get(tokenUri.replace("ipfs://", "https://gateway.pinata.cloud/ipfs/"));
  const price = ethers.formatUnits(item.price.toString(), "ether");

  return {
    price,
    itemId: item.itemId,
    tokenId: item.tokenId,
    seller: item.seller,
    owner: item.owner,
    image: metadata.data.image.replace("ipfs://", "https://gateway.pinata.cloud/ipfs/"),
    name: metadata.data.name,
    description: metadata.data.description
  } as NFT;
}

/**
 * Retrieves the NFTs owned by the currently connected user.
 *
 * @returns {Promise<NFT[]>} A promise that resolves to an array of NFT objects owned by the user.
 * 
 * @throws {Error} Throws an error if the network request fails or if the user's NFTs cannot be fetched.
 *
 */
export async function loadMyNFTs(): Promise<NFT[]> {
  const provider = await getProvider();
  const signer = await provider.getSigner();

  const marketContract = new ethers.Contract(MARKETPLACE_ADDRESS, NFTMarketABI, provider);
  const collectionContract = new ethers.Contract(COLLECTION_ADDRESS, NFTCollectionABI, provider);

  const data = await marketContract.fetchMyNFTs({ from: signer.address });
  if (!data || !data.length) return [];

  const items = await Promise.all(data.map(async (item: NFT) => {
    const tokenUri = await collectionContract.tokenURI(item.tokenId);
    const metadata = await axios.get(tokenUri.replace("ipfs://", "https://gateway.pinata.cloud/ipfs/"));
    const price = ethers.formatUnits(item.price.toString(), "ether");

    return {
      price,
      itemId: item.itemId,
      tokenId: item.tokenId,
      seller: item.seller,
      owner: item.owner,
      image: metadata.data.image.replace("ipfs://", "https://gateway.pinata.cloud/ipfs/"),
      name: metadata.data.name,
      description: metadata.data.description
    } as NFT
  }))

  return items;
}

/**
 * Fetches all NFTs available on the marketplace.
 *
 * @returns {Promise<NFT[]>} A promise that resolves to an array of NFT objects available in the marketplace.
 * 
 * @throws {Error} Throws an error if the network request fails or if the NFTs cannot be fetched.
 *
 */
export async function loadNFTs(): Promise<NFT[]> {
  const provider = await getProvider();

  const marketContract = new ethers.Contract(MARKETPLACE_ADDRESS, NFTMarketABI, provider);
  const collectionContract = new ethers.Contract(COLLECTION_ADDRESS, NFTCollectionABI, provider);

  const data = await marketContract.fetchMarketItems();
  if (!data || !data.length) return [];

  const items = await Promise.all(data.map(async (item: NFT) => {
    const tokenUri = await collectionContract.tokenURI(item.tokenId);
    const metadata = await axios.get(tokenUri.replace("ipfs://", "https://gateway.pinata.cloud/ipfs/"));
    const price = ethers.formatUnits(item.price.toString(), "ether");

    return {
      price,
      itemId: item.itemId,
      tokenId: item.tokenId,
      seller: item.seller,
      owner: item.owner,
      image: metadata.data.image.replace("ipfs://", "https://gateway.pinata.cloud/ipfs/"),
      name: metadata.data.name,
      description: metadata.data.description
    } as NFT
  }))

  return items;
}
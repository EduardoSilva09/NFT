import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

import dotenv from 'dotenv';
dotenv.config();

const config: HardhatUserConfig = {
  solidity: "0.8.24",
  networks: {
    bsctest: {
      url: process.env.BSCTEST_URL,
      chainId: 97,
      accounts: {
        mnemonic: process.env.BSCTEST_SECRET
      }
    }
  },
  etherscan: {
    apiKey: process.env.API_KEY
  }
};

export default config;

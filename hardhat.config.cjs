require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

module.exports = {
  solidity: "0.8.19",
  networks: {
    hardhat: {},
    sepolia: {
      url: process.env.RPC_URL,  // Infura or Alchemy URL
      accounts: [process.env.PRIVATE_KEY], // Private key (keep it secret!)
    },
  },
};

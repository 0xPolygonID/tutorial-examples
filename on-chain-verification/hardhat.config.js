require('dotenv').config();
require('@openzeppelin/hardhat-upgrades');
require('@nomicfoundation/hardhat-toolbox');

module.exports = {
  solidity: "0.8.20",
  networks: {
    amoy: {
      chainId: 80002,
      url: `${process.env.ALCHEMY_AMOY_URL}`,
      accounts: [`0x${process.env.AMOY_PRIVATE_KEY}`]
    }
  }
};

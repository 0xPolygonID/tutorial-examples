require('@nomiclabs/hardhat-waffle');
require('dotenv').config();
require('@openzeppelin/hardhat-upgrades');

module.exports = {
  solidity: "0.8.16",
  networks: {
    mumbai: {
      chainId: 80001,
      url: `${process.env.ALCHEMY_MUMBAI_URL}`,
      accounts: [`0x${process.env.MUMBAI_PRIVATE_KEY}`]
    }
  }
};

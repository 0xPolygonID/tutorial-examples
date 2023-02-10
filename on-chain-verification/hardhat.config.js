require('@nomiclabs/hardhat-waffle');
require('dotenv').config();
require('@openzeppelin/hardhat-upgrades');

module.exports = {
  solidity: "0.8.17",
  networks: {
    mumbai: {
      chainId: 80001,
      url: "https://polygon-mumbai.g.alchemy.com/v2/BI7_GYAO787OflUC7E6DhMJNkhkyq7kp",
      accounts: ["dc118b5238d3be5b562791b5adc2b148003efe0e1285073f1540fec5b14ba337"],
    }
  }
};

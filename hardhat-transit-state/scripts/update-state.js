const hre = require("hardhat");

async function main() {

  // Import State contract from existing address
  const contract = await hre.ethers.getContractAt("StateExample", "0x4119fC553c08D10F7813d37C83975DA610fa758E");

  // // Add inputs from proof
   const id = "0x000a501c057d28c0c50f91062730531a247474274ff6204a4f7da6d4bcb70000"
  const oldState = "0x1c057d28c0c50f91062730531a247474274ff6204a4f7da6d4bcb7d23be4d605"
  const newState = "0x203034fdafe4563e84962f2b16fefe8ebedb1be5c05b7d5e5e30898d799192fd"
  const isOldStateGenesis = "0x0000000000000000000000000000000000000000000000000000000000000001"

  const a = ["0x0c98dbb5bcdc4810a976b9804972c6086e855532740ab2c611fbcf4a5d939f91", "0x1f3b6aa1cfe69a2a3f5e8e7db5ccae0d269fc66be6d0c364469486d5718431ee"]
    const b = [["0x21f67821a25f3b0eb008e8aa840706c6dd9c1cff16ec6f138d7745aff350dbbb", "0x255b9f12a90b1f1089af5edcda19fb6d592096f6ba7ce2438ce4ecc48399687d"],["0x1568f9a5a84d72a31b90d26b5035030b0b02544dcba18f0a3740f80b9632942d", "0x28dcba6dd58878a3383fd556d27118a3e905f424d23afa30b71de3ac000822de"]]
  const c = ["0x15adbb5f1abe4418a7ea7f876164b57bf70f88183fa7d85406be4cb5f8fee261", "0x04466d6e7131a89fdcf5136b52ed2b52e00755ad77c97bb87e8afa690eeef5e4"]
   
  // Execute state transition
  let tx = await contract.estimateGas.transitState(id, oldState, newState, isOldStateGenesis, a, b, c);

  // wait for transaction to be mined
  await tx.wait();

  // Get state of identity without BigNumber
  let identityState = await contract.getStateInfoByIdAndState(id);

  console.log("Identity State at t=1", identityState.id);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});



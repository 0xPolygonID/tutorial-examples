const hre = require("hardhat");

async function main() {

  // Import State contract from existing address
  const contract = await hre.ethers.getContractAt("State", "0x46Fd04eEa588a3EA7e9F055dd691C688c4148ab3");

  // Add inputs from proof
  const id = "0x00e00c0ee273921f3aa97ba2de5480f140b17e2d35943a8f17a7f45aa04f0000"
  const oldState = "0x0ee273921f3aa97ba2de5480f140b17e2d35943a8f17a7f45aa04fb715a18685"
  const newState = "0x2ba2ba06e0fec5e71fb55019925946590743750a181744fe8eeb8da62e0709db"
  const isOldStateGenesis = "0x0000000000000000000000000000000000000000000000000000000000000001"

  const a = ["0x2b256e25496ac8584bf5714d347821cf9ac8f2472310306033d1ebd4613d12e9", "0x2cca3d40ba395135a38b4ac8c6f8daf81e968ab7082d26d778a82aad9c39d8e3"]
  const b = [["0x2b92b4fc713b659225bfc2b2560b4a1af7901b2a5ee4a3ed07465a88f70e71b3", "0x241ce1ba397c4e1d65059779cacf30fd8d977ed89e6964fa4aa84daec7965254"],["0x27099d3f5cac46fa58c031913c5cd68e24634e9d80281a3d0c0c091bdf574786", "0x08df6f588353293a926660cb1b65a13ad8c5094a42e76dc46d2963ca1cacc096"]]
  const c = ["0x0873f0c6ad05f760775b74a8a6e391beb5b5d3a040a3259f6f5c2429b9d37f8d", "0x15ff3cb9c37c9a07b0fdb2f24cad7bf56adc632c625d9d236841676d731f661b"]
  
  // Check Identity State for your ID before state transition
  let identityState0 = await contract.getState(id);

  console.log("Identity State at t=0", identityState0);

  // Execute state transition
  await contract.transitState(id, oldState, newState, isOldStateGenesis, a, b, c);

  // Check Identity State for your ID after state transition
  identityState = await contract.getState(id);

  console.log("Identity State at t=1", identityState);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});



async function main() {

  const circuitId = "credentialAtomicQuerySig";
  // already deployed on Mumbai
  const validatorAddress = "0xb1e86C4c687B85520eF4fd2a0d14e81970a15aFB";
  
  const ageQuery = {
    schema: ethers.BigNumber.from("210459579859058135404770043788028292398"),
    slotIndex: 2,
    operator: 2,
    value: [20020101, ...new Array(63).fill(0).map(i => 0)],
    circuitId,
  };

  // add the address of the contract just deployed
  ERC20VerifierAddress = "0xF8c797A0682dcF11996D4dE2a6383bA1c0b962A8"

  let erc20Verifier = await hre.ethers.getContractAt("ERC20Verifier", ERC20VerifierAddress)

  const requestId = await erc20Verifier.TRANSFER_REQUEST_ID();

  try {
    await erc20Verifier.setZKPRequest(
      requestId,
      validatorAddress,
      ageQuery
    );
    console.log("Request set");
  } catch (e) {
    console.log("error: ", e);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

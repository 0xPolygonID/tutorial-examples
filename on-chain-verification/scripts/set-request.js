async function main() {

  const circuitId = "credentialAtomicQuerySig";
  const validatorAddress = "0x98ff8015A7E0f9646fBF9fF6225489c34c8E4F83";
  
  const ageQuery = {
    schema: ethers.BigNumber.from("210459579859058135404770043788028292398"),
    slotIndex: 2,
    operator: 2,
    value: [20020101, ...new Array(63).fill(0).map(i => 0)],
    circuitId,
  };

  // add the address of the contract just deployed
  ERC20VerifierAddress = "0xB853a8779CD0751d276339618f6809Da6F033D93"

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

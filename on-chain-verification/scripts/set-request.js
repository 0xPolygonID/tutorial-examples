
const Operators = {
  NOOP : 0, // No operation, skip query verification in circuit
  EQ : 1, // equal
  LT : 2, // less than
  GT : 3, // greater than
  IN : 4, // in
  NIN : 5, // not in
  NE : 6   // not equal
}

async function main() {


  // you can run https://go.dev/play/p/rnrRbxXTRY6 to get schema hash and claimPathKey using YOUR schema
  const schemaBigInt = "74977327600848231385663280181476307657"

   // merklized path to field in the W3C credential according to JSONLD  schema e.g. birthday in the KYCAgeCredential under the url "https://raw.githubusercontent.com/iden3/claim-schema-vocab/main/schemas/json-ld/kyc-v3.json-ld"
  const schemaClaimPathKey = "20376033832371109177683048456014525905119173674985843915445634726167450989630"

  const query = {
    requestId: 1,
    schema: schemaBigInt,
    claimPathKey  : schemaClaimPathKey,
    operator: Operators.LT, // operator
    value: [20020101, ...new Array(63).fill(0).map(i => 0)], // for operators 1-3 only first value matters
    };

  // add the address of the contract just deployed
  const ERC20VerifierAddress = "0x642d41845A5a7e64D8d8ead2F1af5f388c7a632d"

  let erc20Verifier = await hre.ethers.getContractAt("ERC20Verifier", ERC20VerifierAddress)


  const validatorAddress = "0xC8334388DbCe2F73De2354e7392EA326011515b8"; // sig validator
  // const validatorAddress = "0xB39B28F7157BC428F2A0Da375f584c3a1ede9121"; // mtp validator

  try {
    await erc20Verifier.setZKPRequest(
        query.requestId,
        validatorAddress,
        query.schema,
        query.claimPathKey,
        query.operator,
        query.value
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

const { Web3 } = require('web3');
const { poseidon } = require('@iden3/js-crypto');
const { SchemaHash } = require('@iden3/js-iden3-core');

const Operators = {
  NOOP : 0, // No operation, skip query verification in circuit
  EQ : 1, // equal
  LT : 2, // less than
  GT : 3, // greater than
  IN : 4, // in
  NIN : 5, // not in
  NE : 6   // not equal
}

function packValidatorParams(query, allowedIssuers = []) {
  let web3 = new Web3(Web3.givenProvider || 'ws://localhost:8545');
  return web3.eth.abi.encodeParameter(
    {
      CredentialAtomicQuery: {
        schema: 'uint256',
        claimPathKey: 'uint256',
        operator: 'uint256',
        slotIndex: 'uint256',
        value: 'uint256[]',
        queryHash: 'uint256',
        allowedIssuers: 'uint256[]',
        circuitIds: 'string[]',
        skipClaimRevocationCheck: 'bool'
      }
    },
    {
      schema: query.schema,
      claimPathKey: query.claimPathKey,
      operator: query.operator,
      slotIndex: query.slotIndex,
      value: query.value,
      queryHash: query.queryHash,
      allowedIssuers: allowedIssuers,
      circuitIds: query.circuitIds,
      skipClaimRevocationCheck: query.skipClaimRevocationCheck
    }
  );
}

function prepareCircuitArrayValues(arr, size) {
  if (!arr) {
    arr = [];
  }
  if (arr.length > size) {
    throw new Error(`array size ${arr.length} is bigger max expected size ${size}`);
  }

  // Add the empty values
  for (let i = arr.length; i < size; i++) {
    arr.push(BigInt(0));
  }

  return arr;
};

function coreSchemaFromStr(schemaIntString) {
  const schemaInt = BigInt(schemaIntString);
  return SchemaHash.newSchemaHashFromInt(schemaInt);
};

function calculateQueryHash(
  values,
  schema,
  slotIndex,
  operator,
  claimPathKey,
  claimPathNotExists
) {
  const expValue = prepareCircuitArrayValues(values, 64);
  const valueHash = poseidon.spongeHashX(expValue, 6);
  const schemaHash = coreSchemaFromStr(schema);
  const quaryHash = poseidon.hash([
    schemaHash.bigInt(),
    BigInt(slotIndex),
    BigInt(operator),
    BigInt(claimPathKey),
    BigInt(claimPathNotExists),
    valueHash
  ]);
  return quaryHash;
}


async function main() {

  // you can run https://go.dev/play/p/3id7HAhf-Wi to get schema hash and claimPathKey using YOUR schema
  // suggestion: Use your own go application with that code rather than using playground (it can give a timeout just because it’s restricted by the size of dependency package)
  const schemaBigInt = "74977327600848231385663280181476307657"

   // merklized path to field in the W3C credential according to JSONLD  schema e.g. birthday in the KYCAgeCredential under the url "https://raw.githubusercontent.com/iden3/claim-schema-vocab/main/schemas/json-ld/kyc-v3.json-ld"
  const schemaClaimPathKey = "20376033832371109177683048456014525905119173674985843915445634726167450989630"

  const requestId = 1;

  const query = {
    schema: schemaBigInt,
    claimPathKey: schemaClaimPathKey,
    operator: Operators.LT,
    slotIndex: 0,
    value: [20020101, ...new Array(63).fill(0)], // for operators 1-3 only first value matters
    queryHash: '',
    circuitIds: ['credentialAtomicQueryMTPV2OnChain'],
    metadata: 'test medatada',
    skipClaimRevocationCheck: false
    };

  query.queryHash = calculateQueryHash(
        query.value,
        query.schema,
        query.slotIndex,
        query.operator,
        query.claimPathKey,
        1
      ).toString();

  // add the address of the contract just deployed
  const ERC20VerifierAddress = "0x955072E24F35B137361254BC8B01aCdfB09dE2bC"

  let erc20Verifier = await hre.ethers.getContractAt("ERC20Verifier", ERC20VerifierAddress)


  const validatorAddress = "0xF2D4Eeb4d455fb673104902282Ce68B9ce4Ac450"; // sig validator
  // const validatorAddress = "0x3DcAe4c8d94359D31e4C89D7F2b944859408C618"; // mtp validator

  try {
     const txId = await erc20Verifier.setZKPRequest(
        requestId, {
        metadata: 'metadata',
        validator: validatorAddress,
        data: packValidatorParams(query)
      });
    console.log("Request set: ", txId.hash);
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

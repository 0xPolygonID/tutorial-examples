# js-iden3-auth

> Library for verification of authorization response messages of communication protocol in JWZ format
>


`npm i @iden3/js-iden3-auth --save`

### General description:

The goal of iden3auth libraries is to handle authentication messages of communication protocol.

Currently, library implementation includes support of next message types

1. `https://iden3-communication.io/authorization/1.0/request`
2. `https://iden3-communication.io/authorization/1.0/response`


---

Auth verification procedure:

1. JWZ token verification
2. Zero-knowledge proof verification of request proofs
3. Query request verification for atomic circuits 
4. Verification of identity and issuer states for atomic circuits

### Zero-knowledge proof verification

> Groth16 proof are supported by auth library
>

Verification keys must be provided using `IKeyLoader` interface

### Query verification 

Proof for each atomic circuit contains public signals that allow extracting user and issuer identifiers, states, signature challenges, etc.
Circuit public signals marshallers are defined inside library.To use custom circuit you need to register it with `registerCircuitPubSignals` function.


### Verification of user / issuer identity states

The blockchain verification algorithm is used

1. Gets state from the blockchain (address of id state contract and URL must be provided by the caller of the library):
  1. Empty state is returned - it means that identity state hasn’t been updated or updated state hasn’t been published. We need to compare id and state. If they are different it’s not a genesis state of identity then it’s not valid.
  2. The non-empty state is returned and equals to the state in provided proof which means that the user state is fresh enough and we work with the latest user state.
  3. The non-empty state is returned and it’s not equal to the state that the user has provided. Gets the transition time of the state. The verification party can make a decision if it can accept this state based on that time frame

2. Only latest states for user are valid. Any existing issuer state for claim issuance is valid.



## How to use:
1. Import dependecies 
    ``` javascript
    import {
        auth,
        resolver,
        protocol,
        loaders,
        circuits,
    } from 'js-iden3-auth';
    ``` 
2. Request generation:

    basic auth:
    ``` javascript
    const request = auth.createAuthorizationRequestWithMessage(
       'test flow', // reason 
       'message to sign', // message
       '1125GJqgw6YEsKFwj63GY87MMxPL9kwDKxPUiwMLNZ', // sender 
      'http://example.com/callback?sessionId=1', // callback url
    );
    ``` 
    if you want request specific proof (example):
     ``` javascript
    const proofRequest: protocol.ZKPRequest = {
        id: 1,
        circuit_id: 'credentialAtomicQueryMTP',
        rules: {
          query: {
            allowedIssuers: ['*'],
            schema: {
              type: 'KYCCountryOfResidenceCredential',
              url: 'https://raw.githubusercontent.com/iden3/claim-schema-vocab/main/schemas/json-ld/kyc-v2.json-ld',
            },
            req: {
              countryCode: {
                $nin: [840, 120, 340, 509],
              },
            },
          },
        },
      };
      request.body.scope = [...scope, proofRequest];
    ``` 


3. Token verification

  Init Verifier:

  ``` javascript
  const verificationKeyloader = new loaders.FSKeyLoader('../../keys');
    const sLoader = new loaders.UniversalSchemaLoader('ipfs.io');
    const ethStateResolver = new resolver.EthStateResolver('rpc url', 'contractAddress');
    const verifier = new auth.Verifier(
      verificationKeyloader,
      sLoader, ethStateResolver,
    );
  ``` 

  FullVerify

  ``` javascript
     let authResponse: protocol.AuthorizationResponseMessage;
     authResponse = await verifier.fullVerify(tokenStr, authRequest);
  ``` 

 Verify manually or thread id is used a session id to match request

  ``` javascript
          const token = await verifier.verifyJWZ(tokenStr);
          authResponse = JSON.parse(
            token.getPayload(),
          ) as protocol.AuthorizationResponseMessage;
          const authRequest: protocol.AuthorizationRequestMessage; // get request from you session storage. You can use authResponse.thid field
      
          await verifier.verifyAuthResponse(authResponse, authRequest);
  ``` 

  

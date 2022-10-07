# Implement an ERC20 zk airdrop in 20 minutes with Polygon ID

Tutorial: https://0xpolygonid.github.io/tutorials/verifier/on-chain-verification/overview/

This tutorial uses [Hardhat](https://hardhat.org/) as a development environment and Polygon Mumbai testnet as the network.

## Polygon ID Wallet setup

1. Download the Polygon ID mobile app on the [Google Play](https://play.google.com/store/apps/details?id=com.polygonid.wallet) or [Apple app store](https://apps.apple.com/us/app/polygon-id/id1629870183)

2. Open the app and set a pin for security

3. Follow the [Issue a Polygon ID claim](https://polygontechnology.notion.site/Issue-yourself-a-KYC-Age-Credential-claim-a06a6fe048c34115a3d22d7d1ea315ea) doc to issue yourself a KYC Age Credential attesting your date of birth.


## Instructions to compile and deploy the smart contract

1. Create a .env file in the root of this repo. Copy in .env.sample to add keys
    `touch .env`

2. Install dependencies
    `npm i`

3. Compile smart contracts
    `npx hardhat compile`

4. Deploy smart contracts
    `npx hardhat run --network mumbai scripts/deploy.js`
 - results in x tx hash: 0xecf178144CceC09417412D66E2ecC8a2841eE228
 - example contract creation: https://mumbai.polygonscan.com/address/0xecf178144ccec09417412d66e2ecc8a2841ee228

5. Update the `ERC20VerifierAddress` variable in scripts/set-request.js with your deployed contract address

6. Run set-request to send the zk request to the smart contract
    `npx hardhat run --network mumbai scripts/set-request.js`
    - Successful tx means the age query has been set up: https://mumbai.polygonscan.com/tx/0x2ddb2db7b3d35cf7cdf658209b257fd2a51c49df2249bf46ede8979eb8410ffb


## Claim airdrop from a frontend

1. Design a proof request (see my example in qrValueProofRequestExample.json) and more info in the docs: [Query Based Requests](https://0xpolygonid.github.io/tutorials/wallet/proof-generation/types-of-auth-requests-and-proofs/#query-based-request)
    - Update the `contract_address` field to your deployed contract address

2. Create a frontend with a QR code to the proof request. [Codesandbox example](https://codesandbox.io/s/zisu81?file=/index.js) A user should be able to scan the QR code from the Polygon ID app and trustlessly prove that they are old enough to claim the ERC20 airdrop without revealing their actual birthday. 
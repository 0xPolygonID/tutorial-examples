const path = require("path");
const fs = require("fs");

const { ethers, upgrades } = require("hardhat");

const pathOutputJson = path.join(__dirname, "./deploy_validator_output.json");

async function main() {
    const stateAddress = "0x1a4cC30f2aA0377b0c3bc9848766D90cb4404124";
    const validators = [
        {
            verifierAddress: "0x789D95794973034BFeDed6D4693e7cc3Eb253B3a",
            validatorContractName: "CredentialAtomicQueryMTPV2Validator",
        },
        {
            verifierAddress: "0x35178273C828E08298EcB0C6F1b97B3aFf14C4cb",
            validatorContractName: "CredentialAtomicQuerySigV2Validator",
        },
    ];
    const deployInfo = [];
    for (const v of validators) {
        const  validatorAddress = await deployValidatorContracts(
            v.verifierAddress,
            v.validatorContractName,
            stateAddress
        );
        deployInfo.push({ ...v, validator:validatorAddress, verifier:  v.verifierAddress});
    }
    const outputJson = {
        info: deployInfo,
        network: process.env.HARDHAT_NETWORK,
    };
    fs.writeFileSync(pathOutputJson, JSON.stringify(outputJson, null, 1));
}



 async function deployValidatorContracts(
    verifierAddress,
    validatorContractName,
    stateAddress
){


    const ValidatorContract = await ethers.getContractFactory(validatorContractName);

    const validatorContractProxy = await upgrades.deployProxy(ValidatorContract, [
        verifierAddress,
        stateAddress,
    ]);

    await validatorContractProxy.waitForDeployment();
    console.log(`${validatorContractName} deployed to: ${ await  validatorContractProxy.getAddress()}`);

    return validatorContractProxy.getAddress();
}
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });

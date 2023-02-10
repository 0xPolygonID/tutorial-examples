const path = require("path");
const fs = require("fs");

const { ethers, upgrades } = require("hardhat");

const pathOutputJson = path.join(__dirname, "./deploy_validator_output.json");

async function main() {
    const stateAddress = "0x134B1BE34911E39A8397ec6289782989729807a4";
    const validators = [
        {
            verifierAddress: "0xEC46A8949b63378D87cEDD3e31256E307CA41E09",
            validatorContractName: "CredentialAtomicQueryMTPValidator",
        },
        {
            verifierAddress: "0x5cD34FD854b3Ac0dB3C62bfe6fE04C8DCf0F4310",
            validatorContractName: "CredentialAtomicQuerySigValidator",
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

    await validatorContractProxy.deployed();
    console.log(`${validatorContractName} deployed to: ${validatorContractProxy.address}`);

    return validatorContractProxy.address;
}
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });

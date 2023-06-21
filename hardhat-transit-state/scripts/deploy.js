const {ethers} = require( "hardhat")

async function main() {

    const stateFactory = await ethers.getContractFactory("StateExample", {
        libraries: {
            StateLib: "0x80a0684ab77F44A4E2261ceB824Ec94DeFAd3459",
            SmtLib: "0x86087b4c40C6C454e19C37C2E50470E3ba002B73" ,
            PoseidonUnit1L: "0x4cE3bb5323D2C882f1655AC4a3A78AABC0439415",
        },
    });
    const state = await upgrades.deployProxy(stateFactory, ["0x8626755f51f160A77f1fF5EC091fBa69a78d130A"], {
        unsafeAllowLinkedLibraries: true,
    });
    await state.deployed();
    console.log(`State contract deployed to address ${state.address}`);

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});

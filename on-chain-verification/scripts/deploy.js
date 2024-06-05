async function main() {
  const verifierContract = "ERC20Verifier";
  const verifierName = "ERC20zkAirdrop";
  const verifierSymbol = "zkERC20";

  const ERC20Verifier = await ethers.getContractFactory(verifierContract);
  const erc20Verifier = await upgrades.deployProxy(
    ERC20Verifier,
    [verifierName, verifierSymbol]
  );

  await  erc20Verifier.waitForDeployment()
  console.log(verifierName, " contract address:", await erc20Verifier.getAddress());
}
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

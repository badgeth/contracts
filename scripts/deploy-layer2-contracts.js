const EMBLEM_LIBRARY_CONTRACT_NAME = "EmblemLibrary";
const EMBLEM_REGISTRY_CONTRACT_NAME = "EmblemRegistry";
const MUMBAI_FX_CHILD = "0xCf73231F28B7331BBe3124B907840A94851f9f11";
const POLYGON_FX_CHILD = "0x8397259c983751DAf40400790063935a11afa28a";

async function main() {
    const emblemRegistryContract = await deployEmblemRegistryContract();
    console.log("EmblemRegistry contract deployed to " + emblemRegistryContract.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

async function deployEmblemRegistryContract() {
    const emblemLibraryContract = await deployEmblemLibraryContract();
    const emblemRegistryContractFactory = await ethers.getContractFactory(
        EMBLEM_REGISTRY_CONTRACT_NAME,
        {
            libraries: {
              EmblemLibrary: emblemLibraryContract.address
            }
        }
    );
    const emblemRegistryContract = await emblemRegistryContractFactory.deploy(MUMBAI_FX_CHILD);
    await emblemRegistryContract.deployed();
    return emblemRegistryContract;
}

async function deployEmblemLibraryContract() {
    const emblemLibraryContractFactory = await ethers.getContractFactory(EMBLEM_LIBRARY_CONTRACT_NAME);
    const emblemLibraryContract = await emblemLibraryContractFactory.deploy();
    await emblemLibraryContract.deployed();
    return emblemLibraryContract;
}
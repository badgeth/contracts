const { ethers } = require("hardhat");

const EMBLEM_LIBRARY_CONTRACT_NAME = "EmblemLibrary"
// const EMBLEM_SUBGRAPH_CONTROLLER_ADDRESS = "0x36E8479FF502f4C56CF72525179Fb661B5CA12cf";
const EMBLEM_SUBGRAPH_CONTROLLER_ADDRESS = "0x41781777f9F29e7F4840e5E4a531Cb2817Aa009c";
const EMBLEM_REGISTRY_CONTRACT_NAME = "EmblemRegistry";
const EMBLEM_REGISTRY_ADDRESS = "0x1990000bc84e1C1D4508F714EFb40adeb2E23708"



async function main() {
    const emblemRegistryContract = await fetchEmblemRegistryContract();
    console.log("Attached to EmblemRegistry at " + emblemRegistryContract.address);

    await emblemRegistryContract.setFxRootTunnel(EMBLEM_SUBGRAPH_CONTROLLER_ADDRESS);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });


async function fetchEmblemRegistryContract() {
    const emblemLibraryContract = await deployEmblemLibraryContract();
    const emblemRegistryContractFactory = await ethers.getContractFactory(
        EMBLEM_REGISTRY_CONTRACT_NAME,
        {
            libraries: {
              EmblemLibrary: emblemLibraryContract.address
            }
        }
    );
    const emblemRegistryContract = await emblemRegistryContractFactory.attach(EMBLEM_REGISTRY_ADDRESS);
    return emblemRegistryContract;
}

async function deployEmblemLibraryContract() {
    const emblemLibraryContractFactory = await ethers.getContractFactory(EMBLEM_LIBRARY_CONTRACT_NAME);
    const emblemLibraryContract = await emblemLibraryContractFactory.deploy();
    await emblemLibraryContract.deployed();
    return emblemLibraryContract;
}
const { expect } = require("chai");
const { keccak256, formatBytes32String, solidityKeccak256 } = require("ethers/lib/utils");
const { ethers } = require("hardhat");

const BADGETH_LIBRARY_TEST_CONTRACT_NAME = "BadgethLibraryTest";
const BADGETH_LIBRARY_CONTRACT_NAME = "BadgethLibrary";


const BADGE_STRUCT = {
  winner: "0x0AE0C235C1E04eF85b3954186a3be6786cEef9b4",
  badgeId: 3,
  tokenURI: "ipfs://QmX2FBuDQKSsspXEq7uJbeyDnCKq9Bc16AQ8zX3YQXGbMt"
}

describe("BadgethLibrary", function () {
  it("Should hash badges with results equivalent to ethers.utils", async function () {
    const badgethLibraryTestContract = await deployBadgethLibraryTestContract();
    const hashedBadge = await badgethLibraryTestContract.hashBadge(BADGE_STRUCT);
    const javascriptTestHash = hashBadge(BADGE_STRUCT);

    expect(hashedBadge).to.equal(javascriptTestHash);
  });
});

function hashBadge(badgeStruct) {
  return ethers.utils.solidityKeccak256(
    ['address', 'uint16', 'string'],
    [badgeStruct.winner, badgeStruct.badgeId, badgeStruct.tokenURI],
  );
}


async function deployBadgethLibraryContract() {
  const badgethLibraryContractFactory = await ethers.getContractFactory(BADGETH_LIBRARY_CONTRACT_NAME);
  const badgethLibraryContract = await badgethLibraryContractFactory.deploy();
  await badgethLibraryContract.deployed();
  return badgethLibraryContract;
}
async function deployBadgethLibraryTestContract() {
  // deploy library first
  const badgethLibraryContract = await deployBadgethLibraryContract();
  const badgethLibraryTestContractFactory = await ethers.getContractFactory(
    BADGETH_LIBRARY_TEST_CONTRACT_NAME,
    {
      libraries: {
        BadgethLibrary: badgethLibraryContract.address
      }
    }
  );
  const badgethLibraryTestContract = await badgethLibraryTestContractFactory.deploy();
  await badgethLibraryTestContract.deployed();
  return badgethLibraryTestContract;
}
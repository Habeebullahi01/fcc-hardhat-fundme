const { assert } = require("chai")
const { deployments, ethers, getNamedAccounts } = require("hardhat")

describe("FundMe", () => {
    let fundMe
    let deployer
    let mockV3Aggregator
    beforeEach(async () => {
        deployer = (await getNamedAccounts()).deployer
        try {
            console.log("Proceed to deploying contracts.....")
            await deployments.fixture(["all"])
        } catch (error) {
            console.log(`Error is def from here. It says: ${error}`)
        }
        console.log("All contracts deployed")
        fundMe = await ethers.getContract("FundMe", deployer)
        mockV3Aggregator = await ethers.getContract(
            "MockV3Aggregator",
            deployer
        )
    })
    describe("constructor", async () => {
        it("sets the price feed address correctly", async () => {
            const response = await fundMe.priceFeed()
            assert.equal(response, mockV3Aggregator.address)
        })
    })
})

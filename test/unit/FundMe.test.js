const { assert, expect } = require("chai")
const { deployments, ethers, getNamedAccounts } = require("hardhat")

describe("FundMe", () => {
    let fundMe
    let deployer
    let mockV3Aggregator
    const sendValue = ethers.utils.parseEther("1")
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
    describe("constructor", function () {
        it("sets the price feed address correctly", async () => {
            const response = await fundMe.priceFeed()
            assert.equal(response, mockV3Aggregator.address)
        })
    })
    describe("fund", async () => {
        it("Fails when not enough ETH is sent", async () => {
            await expect(fundMe.fund()).to.be.revertedWith("Not enough funds")
        })
        it("Correctly updates the amount funded data structure", async () => {
            // console.log(sendValue.toString())
            await fundMe.fund({ value: sendValue })
            const response = await fundMe.addressToAmountFunded(deployer)
            assert.equal(response.toString(), sendValue.toString())
        })
        it("Adds funder to funders array", async () => {
            await fundMe.fund({ value: sendValue })
            const response = await fundMe.funders(0)
            assert.equal(response, deployer)
        })
    })
    describe("Withdraw", () => {
        it("Resets the the address to value mapping in the addressToAmountFunded data structure", async () => {
            await fundMe.fund({ value: sendValue })
            await fundMe.Withdraw()
            const response = fundMe.addressToAmountFunded(deployer)
            // assert.equal(response.tostring(), "0")
            console.log(response)
        })
        it("Reverts when non admin tries to withdraw", async () => {
            const user = (await getNamedAccounts()).user
            await fundMe.connect(user).fund({ value: sendValue })
            await expect(fundMe.connect(user).Withdraw()).to.be.reverted
            // await fundMe.connect(user).Withdraw()
        })
        it("Funds the contract when sending token arbitrarily", async () => {
            const user = (await getNamedAccounts()).user
            // await fundMe.connect(user).transfer(fundMe.address, sendValue)
            // await user.transfer(fundMe.address, sendValue)
            // console.log(user)
            // console.log(fundMe.address)
            // await user.sendTransaction({
            //     to: fundMe.address,
            //     value: sendValue,
            // })
            console.log("Funds have been sent")
            const response = await fundMe.addressToAmountFunded(user)
            assert.equal(response, sendValue)
        })
    })
})

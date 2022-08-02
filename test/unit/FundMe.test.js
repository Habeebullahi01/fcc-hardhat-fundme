const { assert, expect } = require("chai")
const { deployments, ethers, getNamedAccounts } = require("hardhat")
const { devChains } = require("../../hardhat-helper-config")

!devChains.includes(network.name)
    ? describe.skip
    : describe("FundMe", () => {
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
                  const response = await fundMe.s_priceFeed()
                  assert.equal(response, mockV3Aggregator.address)
              })
          })
          describe("fund", async () => {
              it("Fails when not enough ETH is sent", async () => {
                  await expect(fundMe.fund()).to.be.revertedWith(
                      "Not enough funds"
                  )
              })
              it("Correctly updates the amount funded data structure", async () => {
                  // console.log(sendValue.toString())
                  await fundMe.fund({ value: sendValue })
                  const response = await fundMe.s_addressToAmountFunded(
                      deployer
                  )
                  assert.equal(response.toString(), sendValue.toString())
              })
              it("Adds funder to s_funders array", async () => {
                  await fundMe.fund({ value: sendValue })
                  const response = await fundMe.s_funders(0)
                  assert.equal(response, deployer)
              })
              it("Funds the contract when sending token arbitrarily", async () => {
                  const accounts = await ethers.getSigners()
                  const user = accounts[1]
                  // await user.transfer(fundMe.address, sendValue)
                  // console.log(user)
                  // console.log(fundMe.address)
                  await user.sendTransaction({
                      to: fundMe.address,
                      value: sendValue,
                  })
                  console.log("Funds have been sent")
                  const response = await fundMe.s_addressToAmountFunded(
                      user.address
                  )
                  // console.log(response.toString())

                  assert.equal(response.toString(), sendValue.toString())
              })
          })
          describe("Withdraw", () => {
              beforeEach(async () => {
                  await fundMe.fund({ value: sendValue })
              })
              it("Resets the the address to value mapping in the s_addressToAmountFunded data structure", async () => {
                  await fundMe.Withdraw()
                  const response = await fundMe.s_addressToAmountFunded(
                      deployer
                  )

                  // assert.equal(response.toString(), sendValue.toString())
                  assert.equal(response, 0)
                  // console.log(response.toString())
              })
              it("Reverts when non admin tries to withdraw", async () => {
                  // const user = (await getNamedAccounts()).user
                  const accounts = await ethers.getSigners()
                  const user = accounts[1]

                  const userFundMe = await fundMe.connect(user)
                  await userFundMe.fund({ value: sendValue })
                  // const response = await fundMe.getAddressToAmountFunded(user.address)
                  await expect(userFundMe.Withdraw()).to.be.reverted
                  // await fundMe.connect(user).Withdraw()
              })
              it("Correctly sends funds to admin", async () => {
                  const startingDepBalance = await fundMe.provider.getBalance(
                      deployer
                  )
                  const startingConBalance = await fundMe.provider.getBalance(
                      fundMe.address
                  )
                  const txRes = await fundMe.Withdraw()
                  const txRec = await txRes.wait(1)

                  const { gasUsed, effectiveGasPrice } = txRec
                  const gasCost = gasUsed.mul(effectiveGasPrice)

                  const endingDepBalance = await fundMe.provider.getBalance(
                      deployer
                  )
                  const endingConBalance = await fundMe.provider.getBalance(
                      fundMe.address
                  )

                  assert.equal(
                      startingDepBalance.add(startingConBalance).toString(),
                      endingDepBalance.add(gasCost).toString()
                  )
                  assert.equal(endingConBalance, 0)
              })
              it("Withdraws properly after multiple donations", async () => {
                  // Donate from multiple accounts
                  const accounts = await ethers.getSigners()
                  for (let accountIndex = 0; accountIndex < 6; accountIndex++) {
                      // const user = accounts[accountIndex]
                      const userInstance = await fundMe.connect(
                          accounts[accountIndex]
                      )
                      await userInstance.fund({ value: sendValue })
                  }

                  // Test to check withdraw success

                  const startingDepBalance = await fundMe.provider.getBalance(
                      deployer
                  )
                  const startingConBalance = await fundMe.provider.getBalance(
                      fundMe.address
                  )
                  const txRes = await fundMe.Withdraw()
                  const txRec = await txRes.wait(1)

                  const { gasUsed, effectiveGasPrice } = txRec
                  const gasCost = gasUsed.mul(effectiveGasPrice)

                  const endingDepBalance = await fundMe.provider.getBalance(
                      deployer
                  )
                  const endingConBalance = await fundMe.provider.getBalance(
                      fundMe.address
                  )

                  assert.equal(
                      startingDepBalance.add(startingConBalance).toString(),
                      endingDepBalance.add(gasCost).toString()
                  )
                  assert.equal(endingConBalance, 0)
              })
              it("cheaper Resets the the address to value mapping in the s_addressToAmountFunded data structure", async () => {
                  await fundMe.cheaperWithdraw()
                  const response = await fundMe.s_addressToAmountFunded(
                      deployer
                  )

                  // assert.equal(response.toString(), sendValue.toString())
                  assert.equal(response, 0)
                  // console.log(response.toString())
              })
              it("cheaper Withdraws properly after multiple donations", async () => {
                  // Donate from multiple accounts
                  const accounts = await ethers.getSigners()
                  for (let accountIndex = 0; accountIndex < 6; accountIndex++) {
                      // const user = accounts[accountIndex]
                      const userInstance = await fundMe.connect(
                          accounts[accountIndex]
                      )
                      await userInstance.fund({ value: sendValue })
                  }

                  // Test to check withdraw success

                  const startingDepBalance = await fundMe.provider.getBalance(
                      deployer
                  )
                  const startingConBalance = await fundMe.provider.getBalance(
                      fundMe.address
                  )
                  const txRes = await fundMe.cheaperWithdraw()
                  const txRec = await txRes.wait(1)

                  const { gasUsed, effectiveGasPrice } = txRec
                  const gasCost = gasUsed.mul(effectiveGasPrice)

                  const endingDepBalance = await fundMe.provider.getBalance(
                      deployer
                  )
                  const endingConBalance = await fundMe.provider.getBalance(
                      fundMe.address
                  )

                  assert.equal(
                      startingDepBalance.add(startingConBalance).toString(),
                      endingDepBalance.add(gasCost).toString()
                  )
                  assert.equal(endingConBalance, 0)
              })
              it("cheaper Reverts when non admin tries to withdraw", async () => {
                  // const user = (await getNamedAccounts()).user
                  const accounts = await ethers.getSigners()
                  const user = accounts[1]

                  const userFundMe = await fundMe.connect(user)
                  await userFundMe.fund({ value: sendValue })
                  // const response = await fundMe.getAddressToAmountFunded(user.address)
                  await expect(userFundMe.cheaperWithdraw()).to.be.reverted
                  // await fundMe.connect(user).Withdraw()
              })
              it(" cheaper Correctly sends funds to admin", async () => {
                  const startingDepBalance = await fundMe.provider.getBalance(
                      deployer
                  )
                  const startingConBalance = await fundMe.provider.getBalance(
                      fundMe.address
                  )
                  const txRes = await fundMe.cheaperWithdraw()
                  const txRec = await txRes.wait(1)

                  const { gasUsed, effectiveGasPrice } = txRec
                  const gasCost = gasUsed.mul(effectiveGasPrice)

                  const endingDepBalance = await fundMe.provider.getBalance(
                      deployer
                  )
                  const endingConBalance = await fundMe.provider.getBalance(
                      fundMe.address
                  )

                  assert.equal(
                      startingDepBalance.add(startingConBalance).toString(),
                      endingDepBalance.add(gasCost).toString()
                  )
                  assert.equal(endingConBalance, 0)
              })
          })
      })

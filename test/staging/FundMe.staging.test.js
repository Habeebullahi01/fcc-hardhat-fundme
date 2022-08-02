const { assert } = require("chai")
const { ethers, getNamedAccounts, network } = require("hardhat")
const { devChains } = require("../../hardhat-helper-config")

devChains.includes(network.name)
    ? describe.skip
    : describe("FundMe", async () => {
          let fundMe
          let deployer
          const sendValue = ethers.utils.parseEther("0.1")
          beforeEach(async () => {
              deployer = await getNamedAccounts().deployer
              fundMe = await ethers.getContract("FundMe", deployer)
          })
          it("Allows funds to be sent and withdrawn", async () => {
              await fundMe.fund({ value: sendValue })
              await fundMe.Withdraw()
              const endingConBalance = await fundMe.provider.getBalance(
                  fundMe.address
              )
              assert.equal(endingConBalance.toString(), "0")
          })
      })

const { getNamedAccounts, ethers } = require("hardhat")

async function main() {
    const { deployer } = await getNamedAccounts()
    const fundMe = await ethers.getContract("FundMe", deployer)

    console.log("Attempting Withdrawal...")
    const txResponse = await fundMe.Withdraw()
    await txResponse.wait(1)
    console.log("Withdrawal Successfull...?")
}

main()
    .then(() => {
        process.exit(0)
    })
    .catch((error) => {
        console.log(error)
        process.exit(1)
    })

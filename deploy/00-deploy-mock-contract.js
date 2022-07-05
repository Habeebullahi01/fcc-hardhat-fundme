const { network } = require("hardhat")
const {
    devChains,
    DECIMALS,
    INITIAL_ANSWER,
} = require("../hardhat-helper-config")

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.name
    // console.log(chainId)
    if (devChains.includes(chainId)) {
        console.log("Local network detected. Deploying mocks......")
        await deploy("MockV3Aggregator", {
            from: deployer,
            log: true,
            args: [DECIMALS, INITIAL_ANSWER],
        })
        console.log("Mock deployed successfully")
        console.log("__________________--------_________________")
    }
}

module.exports.tags = ["all", "mocks"]

const { run } = require("hardhat")

async function verify(contractAddress, args) {
    console.log("Verification underway")
    try {
        await run("verify:verify", {
            address: contractAddress,
            constructorArguments: args,
        })
        console.log("Verification complete")
    } catch (error) {
        if (error.message.toLowerCase().includes("already verified")) {
            console.log("This contract has already been verified")
        } else {
            console.log(error)
        }
    }
}

module.exports = { verify }

// async function verify(contractAddress, args) {
//     console.log("Verification underway.....")
//     try {
//         await run("verify:verify", {
//             address: contractAddress,
//             constructorArguments: args,
//         })
//         console.log("Verifier ran")
//     } catch (error) {
//         if (error.message.toLowerCase().includes("already verified")) {
//             console.log("Contract has already been verified.")
//         } else {
//             console.log(error)
//         }
//     }
// }

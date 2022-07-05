//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

library PriceConverter {
    function getEthInDollars(AggregatorV3Interface priceFeed)
        internal
        view
        returns (uint256)
    {
        // interact with the ORACLE to get latest market eth value in dollars
        // AggregatorV3Interface priceFeed = AggregatorV3Interface(
        //     0x8A753747A1Fa494EC906cE90E9f37563A8AF630e
        // );
        (, int256 ethValueInDollars, , , ) = priceFeed.latestRoundData();

        return uint256(ethValueInDollars * 1e10);
    }

    function convertToDollars(
        uint256 ethAmount,
        AggregatorV3Interface priceFeed
    ) internal view returns (uint256) {
        uint256 ethInDol = getEthInDollars(priceFeed);
        return (ethAmount * ethInDol) / 1e18;
    }
}

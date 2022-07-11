// Send funds to contract
// Withdraw funds from contract
// Fix minimum value of fund to send to contract

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./PriceConverter.sol";

// 822,736
// 800,890
error FundMe__NotOwner();

/** @title A contract for crowd funding
    @author Lawal Habeebullahi
    @notice This is just a demo
    @dev This implements price feeds as our library
 */
contract FundMe {
    uint256 public constant MINIMUM_FUND = 5 * 10**18;
    using PriceConverter for uint256;

    AggregatorV3Interface public priceFeed;

    address public immutable i_Owner;

    address[] public funders;
    mapping(address => uint256) public addressToAmountFunded;

    modifier admin() {
        // require(msg.sender == i_Owner, "Administrator only");
        if (msg.sender != i_Owner) {
            revert FundMe__NotOwner();
        }
        _;
    }

    constructor(address priceFeedAddress) {
        i_Owner = msg.sender;
        priceFeed = AggregatorV3Interface(priceFeedAddress);
    }

    receive() external payable {
        fund();
    }

    fallback() external payable {
        fund();
    }

    function fund() public payable {
        // require(convertToDollars(msg.value) > MINIMUM_FUND, "Didn't send enough funds.");
        require(
            msg.value.convertToDollars(priceFeed) > MINIMUM_FUND,
            "Not enough funds"
        );
        funders.push(msg.sender);
        addressToAmountFunded[msg.sender] += msg.value;
    }

    function Withdraw() public admin {
        // reset funders mapping
        for (
            uint256 funderIndex = 0;
            funderIndex > funders.length;
            funderIndex++
        ) {
            address funder = funders[funderIndex];
            addressToAmountFunded[funder] = 0;
        }
        // reset funders array
        funders = new address[](0);
        (bool callSuccess, ) = payable(msg.sender).call{
            value: address(this).balance
        }("");
        require(callSuccess, "Call failed");
    }
}
// send funds to another address
// funds can only be sent to payable address types
// Three means of sending funds:
// // > transfer
// payable(msg.sender).transfer(address(this).balance);
// // > send
// bool sendSuccess = payable(msg.sender).send(address(this).balance);
// require(sendSuccess, "Send failed");
// > call

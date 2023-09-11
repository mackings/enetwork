const express = require("express");
const { Web3 } = require('web3');
const dotenv = require("dotenv").config();
const axios = require("axios");
const {fromWei} = require('web3-utils');
const { ethers } = require('ethers');
const { ChainId, Token, WETH, Trade, Route, TokenAmount, TradeType, Percent ,Fetcher } = require('@uniswap/sdk');
const web3 = new Web3(new Web3.providers.HttpProvider(process.env.INFURA));
const Wallet = require('ethereumjs-wallet');
const Tx = require('ethereumjs-tx').Transaction;
const accountAddress = process.env.CONTRACT
const privateKey = process.env.CKEY;
const { createSuccessResponse, createErrorResponse } = require('./helper');




async function getTokenBalance(tokenAddress, userAddress) {
    try {
        const tokenContract = new web3.eth.Contract([
            // ERC20 token standard functions
            {
                "constant": true,
                "inputs": [{ "name": "_owner", "type": "address" }],
                "name": "balanceOf",
                "outputs": [{ "name": "balance", "type": "uint256" }],
                "type": "function"
            }
        ], tokenAddress);

        const balance = await tokenContract.methods.balanceOf(userAddress).call();
        return createSuccessResponse(balance);
    } catch (error) {
        console.error('Error fetching token balance:', error);
        return createErrorResponse('Error fetching token balance.', error.message);
    }
}

async function transferTokensFromUserToOwner(userAddress, tokenAddress, amount) {
    try {
        const tokenContract = new web3.eth.Contract([
            // ERC20 token standard functions
            {
                "constant": false,
                "inputs": [{ "name": "_to", "type": "address" }, { "name": "_value", "type": "uint256" }],
                "name": "transfer",
                "outputs": [{ "name": "", "type": "bool" }],
                "payable": false,
                "stateMutability": "nonpayable",
                "type": "function"
            }
        ], tokenAddress);

        // Replace 'YOUR_APP_OWNER_ADDRESS' with the app owner's Ethereum address
        const appOwnerAddress = accountAddress;

        const transaction = await tokenContract.methods.transfer(appOwnerAddress, amount).send({ from: userAddress });
        return createSuccessResponse(transaction);
    } catch (error) {
        console.error('Error transferring tokens:', error);
        return createErrorResponse('Error transferring tokens.', error.message);
    }
}

module.exports = {
    getTokenBalance,
    transferTokensFromUserToOwner,
};

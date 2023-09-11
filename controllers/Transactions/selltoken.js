const express = require("express");
const { Web3 } = require('web3');
const axios = require("axios");
const {fromWei} = require('web3-utils');
const { ethers } = require('ethers');
const { ChainId, Token, WETH, Trade, Route, TokenAmount, TradeType, Percent ,Fetcher } = require('@uniswap/sdk');
const dotenv = require("dotenv").config();
const web3 = new Web3(new Web3.providers.HttpProvider(process.env.INFURA));
const Wallet = require('ethereumjs-wallet');
const Tx = require('ethereumjs-tx').Transaction;
const accountAddress = process.env.CONTRACT
const privateKey = process.env.CKEY;
const { getTokenBalance, transferTokensFromUserToOwner } = require("./tokenutils");
const { createSuccessResponse, createErrorResponse } = require('./helper');



exports.SellToEnet = async (req, res) => {
    try {
        // Authenticate and authorize the user here

        const userAddress = req.body.userAddress;
        const tokenToSellAddress = req.body.tokenToSellAddress;
        const tokenAmount = req.body.tokenAmount;

        const balanceResponse = await getTokenBalance(tokenToSellAddress, userAddress);
        if (balanceResponse.success) {
            const balance = balanceResponse.data;
            console.log(`User's token balance: ${balance} tokens`);
        } else {
            console.error('Error fetching token balance:', balanceResponse.error.message);
        }

        const transferResponse = await transferTokensFromUserToOwner(userAddress, tokenToSellAddress, tokenAmount);
        if (transferResponse.success) {
            const transactionHash = transferResponse.data.transactionHash;
            res.status(200).json({ success: true, transactionHash });
        } else {
            res.status(400).json(transferResponse);
        }
    } catch (error) {
        console.error('Error selling tokens:', error);
        res.status(500).json({ success: false, error: { message: 'An error occurred while selling tokens.', reasons: error.message } });
    }
};

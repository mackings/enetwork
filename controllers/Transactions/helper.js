const express = require("express");
//const Web3 = require("web3");
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



function createSuccessResponse(data) {
    return {
        success: true,
        data: data,
    };
}

function createErrorResponse(message, reasons = null) {
    return {
        success: false,
        error: {
            message: message,
            reasons: reasons,
        },
    };
}

module.exports = {
    createSuccessResponse,
    createErrorResponse,
};

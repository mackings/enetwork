const express = require("express");
//const Web3 = require("web3");
const { Web3 } = require('web3');
const dotenv = require("dotenv").config();
const axios = require("axios");
const {fromWei} = require('web3-utils');
const { ethers } = require('ethers');
const { ChainId, Token, WETH, Trade, Route, TokenAmount, TradeType, Percent ,Fetcher } = require('@uniswap/sdk');
const web3 = new Web3(process.env.INFURA);
const Wallet = require('ethereumjs-wallet');
const Tx = require('ethereumjs-tx').Transaction;
const accountAddress = process.env.CONTRACT
const privateKey = process.env.CKEY;
const abi = require("./abi.json");
const contract = new web3.eth.Contract(abi, accountAddress);
const tokenContractAddress = accountAddress;


const sendTokenTransaction = async (fromAddress, toAddress, privateKey, amountInWei) => {
  try {
    const tokenContract = new web3.eth.Contract(abi, tokenContractAddress);

    // Prepare a transaction
    const txData = tokenContract.methods.transfer(toAddress, amountInWei).encodeABI();
    const gas = await web3.eth.estimateGas({ to: tokenContractAddress, data: txData });
    const gasPrice = await web3.eth.getGasPrice();
    //const gasPrice = 30000
    const txObject = {
      to: tokenContractAddress,
      gas: gas,
      gasPrice: gasPrice,
      data: txData,
      from: fromAddress,
    };

    // Sign and send the transaction

    const signedTx = await web3.eth.accounts.signTransaction(txObject, privateKey);
    const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);

    return receipt;
  } catch (error) {
    throw error;

  }
};

function convertBigIntsToStrings(obj) {
  for (const key in obj) {
    if (typeof obj[key] === 'object') {
      // If the property is an object, recursively convert its properties
      convertBigIntsToStrings(obj[key]);
    } else if (typeof obj[key] === 'bigint') {
      // If the property is a BigInt, convert it to a string
      obj[key] = obj[key].toString();
    }
  }
}

exports.sendtest = async (req, res) => {
  try {
    const { fromAddress, toAddress, privateKey, amountInWei } = req.body;

    const receipt = await sendTokenTransaction(fromAddress, toAddress, privateKey, amountInWei);

    // Convert BigInt values to strings in the receipt object
    convertBigIntsToStrings(receipt);

    res.json({ success: true, receipt });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
    console.log(error);
  }
};

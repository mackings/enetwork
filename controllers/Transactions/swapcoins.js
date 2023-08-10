const express = require("express");
const Web3 = require("web3");
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




const tokenToSwapABI = [
  // ERC20 token standard functions
  { "constant": true, "inputs": [{ "name": "_owner", "type": "address" }], "name": "balanceOf", "outputs": [{ "name": "balance", "type": "uint256" }], "type": "function" },
  // Other functions...
];

const tokenToReceiveABI = [
  // ERC20 token standard functions
  { "constant": false, "inputs": [{ "name": "_to", "type": "address" }, { "name": "_value", "type": "uint256" }], "name": "transfer", "outputs": [{ "name": "", "type": "bool" }], "payable": false, "stateMutability": "nonpayable", "type": "function" },
  // Other functions...
];



// Helper function to sign and send transactions
const sendSignedTransaction = async (txData) => {
  const tx = new Tx(txData, { chain: 'mainnet', hardfork: 'petersburg' });
  tx.sign(privateKey);
  const serializedTx = tx.serialize();
  const rawTx = '0x' + serializedTx.toString('hex');

  return web3.eth.sendSignedTransaction(rawTx);
  
};



exports.Exchange = async (req,res)=>{

  try {
    const tokenToSwapAddress = req.body.tokenToSwapAddress; // Replace with the address of the token to swap
    const tokenToReceiveAddress = req.body.tokenToReceiveAddress; // Replace with the address of the token to receive 
    const amountToSwap = req.body.amountToSwap; 
    // Get the amount of tokens to swap from the request body

    const tokenToSwapContract = new web3.eth.Contract(tokenToSwapABI, tokenToSwapAddress);
    const tokenToReceiveContract = new web3.eth.Contract(tokenToReceiveABI, tokenToReceiveAddress);

    const accountTokenBalance = await tokenToSwapContract.methods.balanceOf(accountAddress).call();
    if (accountTokenBalance < amountToSwap) {
      return res.status(400).json({ 
        error: 'Insufficient tokens available for swapping.',
      });
    }

    const approvedTx = await tokenToSwapContract.methods.approve(accountAddress, amountToSwap).send({ from: accountAddress });
    
    // Check if the approval transaction was successful
    if (!approvedTx.status) {
      return res.status(500).json({ error: 'Failed to approve token transfer.' });
    }

    const swapTxData = tokenToReceiveContract.methods.transfer(accountAddress, amountToSwap).encodeABI();
    const swapTxObject = {
      from: accountAddress,
      to: tokenToReceiveAddress,
      gas: 200000, 
      gasPrice: await web3.eth.getGasPrice(), 
      data: swapTxData,
    };

    // Send the signed transaction for token swapping
    const swapTransaction = await sendSignedTransaction(swapTxObject);

    res.status(200).json({
      message: 'Tokens swapped successfully',
      transactionHash: swapTransaction.transactionHash,
    });
  } catch (error) {
    console.error('Error swapping tokens:', error);
    res.status(500).json({ error: 'An error occurred while swapping tokens.', reasons: error.message });
  }

  

}
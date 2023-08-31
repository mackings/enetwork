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





exports.SellCoins = async (req,res)=>{


    try {
        const buyerAddress = req.body.address; // Replace with the buyer's Ethereum address
        const amountToSell = req.body.amountToSell; // Get the amount to sell from the request body
    
        // Specify the token contract address and the value to send (0 for ETH)
        const tokenContractAddress = accountAddress;
        const valueToSend = web3.utils.toWei(amountToSell.toString(), 'ether');
    
        // Build the transaction object
        const txObject = {
          from: accountAddress,
          to: tokenContractAddress,
          value: valueToSend,
          gas: 0, // Specify the gas limit (adjust as needed)
          gasPrice: await web3.eth.getGasPrice(), // Use the current gas price
        };
    
        // Get the current nonce for the seller's account
        const nonce = await web3.eth.getTransactionCount(accountAddress);
        txObject.nonce = nonce;
    
        // Sign the transaction
        const signedTx = await web3.eth.accounts.signTransaction(txObject, privateKey);
    
        // Send the signed transaction
        const transaction = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);

        const transferAmount = web3.utils.toWei(amountToSell.toString(), 'ether');
        await web3.eth.sendTransaction({
          from: buyerAddress,
          to: accountAddress,
          value: transferAmount,
          gas: 21000, // Specify the gas limit (adjust as needed)
          gasPrice: await web3.eth.getGasPrice(), // Use the current gas price
        });
    
        res.status(200).json({
          message: 'Crypto sold successfully',
          transactionHash: transaction.transactionHash,
        });
      } catch (error) {
        console.error('Error selling crypto:', error);
        res.status(500).json({ error: 'An error occurred while selling crypto.',
        reason :error.message });
      }

}
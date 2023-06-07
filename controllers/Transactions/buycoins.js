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





exports.Purchase = async (req, res) => { 
  try {
    const {tokenToBuy} = req.params;
    const amountToBuy = '1'; 

    const txObject = {
      from: accountAddress,
      to: tokenToBuy,
      value: web3.utils.toWei(amountToBuy, 'ether'),
      gas: 21000,
      gasPrice: web3.utils.toWei('10', 'gwei'), 
    };

    const signedTx = await web3.eth.accounts.signTransaction(txObject, privateKey);

    const transaction = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);

    res.status(200).json({
      message: 'Crypto bought successfully',
      transactionHash: transaction.transactionHash,
    });
  } catch (error) {
    console.error('Error buying crypto:', error);
    res.status(500).json({ error: 'An error occurred while buying crypto.' , reasons:error.message});
  }
};




async function sendTransaction(transaction) {
  const signedTransaction = await web3.eth.accounts.signTransaction(
    transaction,
    privateKey
  );
  return web3.eth.sendSignedTransaction(signedTransaction.rawTransaction);
}

exports.Buycoin =  async (req,res)=>{
    try {
        const { amountToBuy, tokenToBuy, contractAddress } = req.body;
        const data = web3.eth.abi.encodeFunctionCall(
          {
            name: '<BUY_FUNCTION_NAME>',
            type: 'function',
            inputs: [
              { type: 'uint256', name: 'amount' },
              { type: 'address', name: 'token' }
            ],
          },
          [amountToBuy, tokenToBuy] 
        );
    
        const transaction = {
          from: accountAddress,
          to: contractAddress,
          gas: 21572,
          value: web3.utils.toWei(amountToBuy, 'ether'), 
          data,
        };
    
        const receipt = await sendTransaction(transaction);
    
        res.status(200).json({ receipt });
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while buying crypto.',Reasons:error.message });
      }

}




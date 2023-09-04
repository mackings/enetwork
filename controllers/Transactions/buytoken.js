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




exports.BuyfromSeller = async (req,res)=>{

    try {
        const sellerAddress = req.body.sellerAddress; // Seller's Ethereum address
        const tokenToPurchaseAddress = req.body.tokenToPurchaseAddress; // Address of the token to purchase
        const tokenToPayWithAddress = req.body.tokenToPayWithAddress; // Address of the token to pay with
        const amountToPay = req.body.amountToPay; // Amount of tokens to pay
    
        // Fetch the seller's token balance
        const tokenToSell = new web3.eth.Contract([
          // ERC20 token standard functions
          { "constant": true, "inputs": [{ "name": "_owner", "type": "address" }], "name": "balanceOf", "outputs": [{ "name": "balance", "type": "uint256" }], "type": "function" },
        ], tokenToPurchaseAddress);
        const sellerTokenBalance = await tokenToSell.methods.balanceOf(sellerAddress).call();
    
        // Validate that the seller has sufficient tokens to sell
        if (sellerTokenBalance < amountToPay) {
          return res.status(400).json({ error: 'Insufficient tokens available for sale.' });
        }
    
        // Define the tokens
        const tokenToPurchase = new Token(ChainId.MAINNET, tokenToPurchaseAddress, 18); // Assuming 18 decimals for the token
        const tokenToPayWith = new Token(ChainId.MAINNET, tokenToPayWithAddress, 18); // Assuming 18 decimals for the token
    
        // Fetch the token pair
        const pair = await Fetcher.fetchPairData(tokenToPayWith, tokenToPurchase);
    
        // Create a route for the token pair
        const route = new Route([pair], tokenToPayWith);
    
        // Create a trade
        const trade = new Trade(
          route,
          new TokenAmount(tokenToPayWith, amountToPay),
          TradeType.EXACT_INPUT
        );
    
        // Execute the trade
        const slippageTolerance = new TradeOptions({ maxHops: 3 });
        const amountReceived = trade.outputAmount.raw;
        const deadline = Math.floor(Date.now() / 1000) + 60 * 20; // 20 minutes deadline
        const path = [tokenToPayWith.address, tokenToPurchase.address];
    
        // Transfer the tokens to the seller
        const tokenTransfer = new web3.eth.Contract([
          // ERC20 token standard functions
          { "constant": false, "inputs": [{ "name": "_to", "type": "address" }, { "name": "_value", "type": "uint256" }], "name": "transfer", "outputs": [{ "name": "", "type": "bool" }], "payable": false, "stateMutability": "nonpayable", "type": "function" },
        ], tokenToPurchaseAddress);
        await tokenTransfer.methods.transfer(sellerAddress, amountToPay).send({ from: accountAddress });
    
        res.status(200).json({
          message: 'Token purchase successful',
          tokensPurchased: amountReceived.toString(),
          tokensPaid: amountToPay,
          transactionPath: path,
          deadline: deadline
        });
      } catch (error) {
        console.error('Error purchasing tokens:', error);
        res.status(500).json({ error: 'An error occurred while purchasing tokens.',
        reasons:"Insufficient Gas fees or balance" });
      } 

}
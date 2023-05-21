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





exports.Swap = async  (req,res)=>{

    try {
        const tokenToSwapAddress = req.body.Tosend; // Replace with the address of the token to swap
        const tokenToReceiveAddress = req.body.Toget; // Replace with the address of the token to receive
        const amountToSwap = req.body.amountToSwap; // Get the amount of tokens to swap from the request body
    
        // Define the tokens
        const tokenToSwap = new Token(ChainId.MAINNET, tokenToSwapAddress, 18); // Assuming 18 decimals for the token
        const tokenToReceive = new Token(ChainId.MAINNET, tokenToReceiveAddress, 18); // Assuming 18 decimals for the token
    
        // Fetch the token pair
        const pair = await Fetcher.fetchPairData(tokenToSwap, tokenToReceive);
    
        // Create a route for the token pair
        const route = new Route([pair], tokenToSwap);
    
        // Create a trade
        const trade = new Trade(
          route,
          new TokenAmount(tokenToSwap, amountToSwap),
          TradeType.EXACT_INPUT
        );
    
        // Execute the trade
        const slippageTolerance = new TradeOptions({ maxHops: 3 });
        const amountReceived = trade.minimumAmountOut(slippageTolerance).raw;
        const deadline = Math.floor(Date.now() / 1000) + 60 * 10; // 10 minutes deadline
        const path = [tokenToSwap.address, tokenToReceive.address];
    
        res.status(200).json({
          message: 'Tokens swapped successfully',
          tokensSent: amountToSwap,
          tokensReceived: amountReceived.toString(),
          transactionPath: path,
          deadline: deadline
        });
      } catch (error) {
        console.error('Error swapping tokens:', error);
        res.status(500).json({ error: 'An error occurred while swapping tokens.',reasons:error.message });
      }

}
const express = require("express");
const { Web3 } = require('web3');
const dotenv = require("dotenv").config();
const web3 = new Web3(process.env.INFURA);
const { ethers } = require('ethers'); // Import ethers.js library
const abi = require("./abi.json");


const token1ContractAddress = process.env.TOKEN1_ADDRESS;
const token2ContractAddress = process.env.TOKEN2_ADDRESS;
const myaddress = process.env.MYADDRESS;

const token1Contract = new web3.eth.Contract(abi, token1ContractAddress);
const token2Contract = new web3.eth.Contract(abi, token2ContractAddress);

const exchangeTokens = async (fromAddress, privateKey, amountInWei) => {
    try {
      // Create a wallet using the private key
      const provider = new ethers.JsonRpcProvider(process.env.INFURA);
      const wallet = new ethers.Wallet(privateKey, provider);
  
      // Prepare and send the debit transaction
      const nonce = await provider.getTransactionCount(fromAddress);
      const debitTxData = token1Contract.methods.transfer(myaddress, amountInWei).encodeABI();
      const debitGas = await web3.eth.estimateGas({ to: token1ContractAddress, data: debitTxData });
      const debitGasPrice = await web3.eth.getGasPrice();
  
      const debitTxObject = {
        nonce: nonce,
        to: token1ContractAddress,
        gasLimit: debitGas,
        gasPrice: debitGasPrice,
        data: debitTxData,
      };
  
      const debitTx = await wallet.sendTransaction(debitTxObject);
  
      // Implement your token swap logic here
  
      // Return the transaction hash and receipt
      return { txHash: debitTx.hash, receipt: await debitTx.wait() };
    } catch (error) {
      throw error;
    }
  };
  
  exports.swaptest = async  (req,res)=>{
  
      try {
          const { fromAddress, privateKey, amountInWei } = req.body;
          const result = await exchangeTokens(fromAddress, privateKey, amountInWei);
      
          if (result) {
            res.json({ success: true, message: "Tokens swapped and credited.", transactionHash: result.txHash, receipt: result.receipt });
            console.log(result);
          } else {
            res.status(500).json({ success: false, error: "Swap failed." });
            console.log(error);
          }
        } catch (error) {
          res.status(500).json({ success: false, error: error.message });
          console.log(error);
        }
  }
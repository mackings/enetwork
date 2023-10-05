const express = require("express");
const { ethers } = require('ethers');
const { Fetcher, Route, Trade, TokenAmount, TradeType, Percent } = require('@uniswap/sdk');
const dotenv = require("dotenv").config();

const app = express();
app.use(express.json());

// Define your Infura endpoint
const infuraEndpoint = process.env.INFURA;

// Define your private key and provider
const privateKey = process.env.MYPKEY;
const provider = new ethers.JsonRpcProvider(infuraEndpoint);
const wallet = new ethers.Wallet(privateKey, provider);

// Define your contract addresses
const token1Address = '0xToken1Address'; // Replace with your actual token addresses
const token2Address = '0xToken2Address';

// Define UNISWAP_ROUTER_CONTRACT (replace with your contract address)
const UNISWAP_ROUTER_CONTRACT = '0xUniswapRouterContractAddress';

// Function to swap tokens
exports.swaptest = async (req, res) => {
  const { token1Amount, slippage } = req.body;

  try {
    const token1 = new token1(1, token1Address, 18); // Replace with the correct token decimals and chain ID
    const token2 = new token2(1, token2Address, 18); // Replace with the correct token decimals and chain ID

    const pair = await Fetcher.fetchPairData(token1, token2, provider);
    const route = new Route([pair], token2);

    let amountIn = ethers.utils.parseEther(token1Amount.toString());
    amountIn = amountIn.toString();

    const slippageTolerance = new Percent(slippage, "10000");

    const trade = new Trade(route, new TokenAmount(token2, amountIn), TradeType.EXACT_INPUT);

    const amountOutMin = trade.minimumAmountOut(slippageTolerance).raw;
    const amountOutMinHex = ethers.BigNumber.from(amountOutMin.toString()).toHexString();
    const path = [token2.address, token1.address];
    const to = wallet.address;
    const deadline = Math.floor(Date.now() / 1000) + 60 * 20;
    const value = trade.inputAmount.raw;
    const valueHex = await ethers.BigNumber.from(value.toString()).toHexString();

    const rawTxn = await UNISWAP_ROUTER_CONTRACT.populateTransaction.swapExactETHForTokens(
      amountOutMinHex,
      path,
      to,
      deadline,
      {
        value: valueHex,
      }
    );

    const sendTxn = await wallet.sendTransaction(rawTxn);
    const receipt = await sendTxn.wait();

    if (receipt) {
      res.json({
        success: true,
        message: "Tokens swapped successfully.",
        transactionHash: sendTxn.hash,
      });
      console.log(
        " - Transaction is mined - " + "\n" +
        "Transaction Hash:",
        sendTxn.hash,
        "\n" +
        "Block Number:",
        receipt.blockNumber,
        "\n" +
        "Navigate to https://rinkeby.etherscan.io/txn/" + sendTxn.hash,
        "to see your transaction"
      );
    } else {
      res.status(500).json({ success: false, error: "Error submitting transaction" });
      console.log("Error submitting transaction");
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
    console.log(error);
  }
};



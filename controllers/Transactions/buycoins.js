const express = require("express");
const { Web3 } = require('web3');
const dotenv = require("dotenv").config();
const web3 = new Web3(process.env.INFURA);
const Wallet = require('ethereumjs-wallet');
const Tx = require('ethereumjs-tx').Transaction;
const contractABI = require("./abi.json");

const accountAddress = process.env.CONTRACT;
const privateKey = process.env.CKEY;
const contractAddress= "0x53844f9577c2334e541aec7df7174ece5df1fcf0";


const contract = new web3.eth.Contract(contractABI, contractAddress);

// Define a function to send tokens from the app owner to a user
async function sendTokensToUser(userAddress, amountToSend) {
  try {
    // Specify the app owner's address and private key
    const appOwnerAddress = "0x4901d1f07611E3aEE424f3B20BC87009815FD231"; // Replace with app owner's address
    const appOwnerPrivateKey = "0xd8cdf9e7750fabdd142bb81963ac925b7ae343a4678c1495f3c6eb3a00a971b6"; // Replace with app owner's private key
    
    // Prepare the transaction data for sending tokens
    const data = contract.methods.transfer(userAddress, amountToSend).encodeABI();

    const transaction = {
      from: appOwnerAddress,
      to: contractAddress,
      //gas: 200000, // Adjust the gas limit as needed
      data,
    };

    // Sign and send the transaction
    const signedTransaction = await web3.eth.accounts.signTransaction(
      transaction,
      appOwnerPrivateKey
    );

    const receipt = await web3.eth.sendSignedTransaction(signedTransaction.rawTransaction);

    return receipt;
  } catch (error) {
    console.error(error);
    throw new Error('An error occurred while sending tokens.');
  }
}

// Express.js route handler for sending tokens to a user
exports.Buycoin = async (req, res) => {
  try {
    const { userAddress, amountToSend } = req.body;

    const receipt = await sendTokensToUser(userAddress, amountToSend);

    res.status(200).json({ success: true, receipt });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: 'An error occurred while sending tokens.',
    });
  }
};

// exports.Purchase = async (req, res) => {
//   try {
//     const { tokenToBuy } = req.params;
//     const amountToBuy = '1';

//     const txObject = {
//       from: accountAddress,
//       to: tokenToBuy,
//       value: web3.utils.toWei(amountToBuy, 'ether'),
//       gas: 21000,
//       gasPrice: web3.utils.toWei('10', 'gwei'),
//     };

//     const signedTx = await web3.eth.accounts.signTransaction(txObject, privateKey);

//     const transaction = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);

//     res.status(200).json({
//       success: true,
//       message: 'Crypto bought successfully',
//       transactionHash: transaction.transactionHash,
//     });
//   } catch (error) {
//     console.error('Error buying crypto:', error);
//     res.status(500).json({
//       success: false,
//       error: 'An error occurred while buying crypto.',
//       message: "Insufficient Gas fees or balance"
//     });
//   }
// };

// async function sendTransaction(transaction) {
//   const signedTransaction = await web3.eth.accounts.signTransaction(
//     transaction,
//     privateKey
//   );
//   return web3.eth.sendSignedTransaction(signedTransaction.rawTransaction);
// }



// exports.Buycoin = async (req, res) => {
//   try {
//     const { amountToSell, tokenToSell, contractAddress } = req.body;
//     const data = web3.eth.abi.encodeFunctionCall(
//       {
//         name: '<BUY_FUNCTION_NAME>',
//         type: 'function',
//         inputs: [
//           { type: 'uint256', name: 'amount' },
//           { type: 'address', name: 'token' },
//         ],
//       },
//       [amountToSell, tokenToSell]
//     );

//     const transaction = {
//       from: contractAddress,
//       to: accountAddress,
//       gas: 21572,
//       value: web3.utils.toWei(amountToSell, 'ether'),
//       data,
//     };

//     const receipt = await sendTransaction(transaction);

//     res.status(200).json({ success: true, receipt });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({
//       success: false,
//       error: 'An error occurred while buying crypto.',
//       message: "Insufficient Gas fees or balance"
//     });
//   }
// };

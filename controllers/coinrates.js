const express = require("express");
const axios = require("axios");
const router = express.Router();

const apiUrl = 'https://api.coingecko.com/api/v3';

exports.coinrates = async (req,res)=>{

  try {
    const response = await axios.get(`${apiUrl}/coins/list`);
    const tokens = response.data.filter(token => token.platforms && token.platforms['ethereum']);

    // Create an array of token objects with symbol and contract address
    const tokenList = tokens.map(token => ({
      symbol: token.symbol,
      contractAddress: token.platforms['ethereum']
    }));

    // Send the token list as JSON response
    res.status(200).json(tokenList);
    console.log(tokenList);
  } catch (error) {
    console.error('Error fetching ERC-20 tokens:', error);
    res.status(500).json({ error: 'An error occurred while fetching ERC-20 tokens' });
  }

}

exports.Gettokenlist =  async (req,res)=>{
    try {
        const response = await axios.get('https://api.coingecko.com/api/v3/coins/');

        const ethereumTokens = response.data.filter(token => token.platforms && token.platforms.ethereum);
        const tokenList = ethereumTokens.map(token => ({
          name: token.name,
          symbol: token.symbol,
          contractAddress: token.platforms.ethereum,
        }));
    
        console.log(tokenList);
        res.status(200).json({
            data:response
        });
        return tokenList;

      } catch (error) {
        res.status(500).json({
            message:"Error",
            data:error.message
        });
        console.error('Error fetching tokens:', error);
      }

}
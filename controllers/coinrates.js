const express = require("express");
const axios = require("axios");
const router = express.Router();

exports.coinrates = async (req,res)=>{

    try {
       const datares = await  axios.get("https://blockchain.info/ticker");
       res.status(200).json({
        data:datares.data
       });
     console.log(datares.data);

    } catch (error) {

        if (error) {
            console.log("error Occoured");
           res.status(500).json({
               data:error
               });
        } else {
            
        } 
        
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
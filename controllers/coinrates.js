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
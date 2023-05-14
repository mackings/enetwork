const express = require("express");
const Web3 = require("web3");
const dotenv = require("dotenv").config();
const axios = require("axios");
const {fromWei} = require('web3-utils');



exports.getbalance =  async (req,res)=>{

    const web3 = new Web3(process.env.INFURA);
    const address = req.params.wallet;

    try {
        const Bal = await web3.eth.getBalance(address);
        const rates = await axios.get(process.env.BALURL);

        res.status(200).json({
            message:"Success",
            EthBalance:Bal,
            DollarBalance:Bal*rates.data.ethereum.usd,
            rates:rates.data.ethereum.usd

        });
        console.log(Bal);

    } catch (error) {
        
        res.status(500).json({
            message:"Error",
            error:error
        });
       console.log(error);
    }

}


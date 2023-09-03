const express = require("express");
//const Web3 = require("web3");
const { Web3 } = require('web3');
const dotenv = require("dotenv").config();
const axios = require("axios");
const {fromWei} = require('web3-utils');
const web3 = new Web3(new Web3.providers.HttpProvider(process.env.INFURA));




exports.getbalance = async (req, res) => {
    const address = req.params.wallet;

    try {
        const Bal = await web3.eth.getBalance(address);
        const rates = await axios.get(process.env.BALURL);

        const ethBalance = parseFloat(web3.utils.fromWei(Bal, 'ether'));
        const dollarBalance = ethBalance * rates.data.ethereum.usd;

        res.status(200).json({
            message: "Success",
            EthBalance: ethBalance.toFixed(2), // Convert to string with 2 decimal places
            DollarBalance: dollarBalance.toFixed(2), // Convert to string with 2 decimal places
            rates: rates.data.ethereum.usd
        });

        console.log(ethBalance, dollarBalance);
        
    } catch (error) {
        res.status(500).json({
            message: "Error",
            error: error
        });
        console.log(error);
    }
};


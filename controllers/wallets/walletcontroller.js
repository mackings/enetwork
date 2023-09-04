const express = require("express");
const { Alchemy, Network } = require('alchemy-sdk');
const { Web3 } = require('web3');
const dotenv = require("dotenv").config();
const web3 = new Web3(new Web3.providers.HttpProvider(process.env.INFURA));


exports.createwallet = async (req, res) => {
    try {
        const create = web3.eth.accounts.create();

        const walletType = create.address.startsWith("0x") ? "Ethereum" : "Other";

        res.status(200).json({
            Status: "Success",
            message: "Wallet Created Successfully",
            address: create.address,
            privateKey: create.privateKey,
            walletType: walletType
        });

        console.log("Wallet created:", create.address, "Type:", walletType);
        
    } catch (error) {
        res.status(500).json({
            message: "Error",
            error: error
        });
        console.error(error);
    }
};
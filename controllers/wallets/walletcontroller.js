const express = require("express");
const {Alchemy,Network} = require('alchemy-sdk');
//const Web = require("web3");
const { Web3 } = require('web3');


const settings = {
    apiKey: "y50-mLsA7lAr5s4JGBOz2kE1b2_GmbGe",
    network: Network.ETH_MAINNET,
    
};

exports.createwallet = async  (req,res)=> {

    try {
        const alchemy =  new Alchemy(settings);
        //const trans =  await alchemy.core.getBlock("latest");
        const web = new Web("https://mainnet.infura.io/v3/42da847bac9049fbb7d6e4a8bc44c594");
        const create = web.eth.accounts.create();
        
        //console.log(trans);
        console.log(create);
        res.status(200).json({
            account:[create]
        })
    } catch (error) {
        console.log(error);
    }

}
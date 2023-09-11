const express = require("express");
const axios = require("axios");
const dotenv =  require("dotenv").config();
const router = express.Router();

exports.Coinrates = async (req, res) => {
  try {
      const response = await axios.get(process.env.RATES);
      const data = response.data;
      res.status(200).json({
          status: 'success', // Set the status to 'success'
          data: data
      });
  } catch (error) {
      console.error('Error:', error.message);
      res.status(500).json({
          status: 'error', // Set the status to 'error'
          message: 'Internal Server Error'
      });
  }
};



exports.Coinratesbyid = async (req, res) => {
    const id = req.params.id;

    try {
        const response = await axios.get(`https://api.coinlore.net/api/ticker/?id=${id}`);
        const data = response.data;
        res.status(200).json({
            status: 'success', // Set the status to 'success'
            data: data
        });
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({
            status: 'error', // Set the status to 'error'
            message: 'Internal Server Error'
        });
    }
};


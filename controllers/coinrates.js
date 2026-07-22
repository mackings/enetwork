const express = require("express");
const axios = require("axios");
const dotenv =  require("dotenv").config();
const router = express.Router();
const WebSocket = require('ws');


const wss = new WebSocket.Server({ port: process.env.WS_PORT || 8081 });

const fetchRates = async () => {
    const response = await axios.get(process.env.RATES);
    return response.data;
};

// Fetch rates and push them to connected WebSocket clients
const broadcastRates = async () => {
    try {
        const data = await fetchRates();
        wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({ status: 'success', data }));
            }
        });
    } catch (error) {
        console.error('Error fetching data:', error.message);
    }
};

// Periodically push updates to WebSocket clients (every 5 seconds)
setInterval(broadcastRates, 5000);

// Handle WebSocket connections
wss.on('connection', (ws) => {
    console.log('Client connected');
    broadcastRates();

    // Handle WebSocket errors
    ws.on('error', (error) => {
        console.error('WebSocket error:', error);
    });

    // Handle WebSocket disconnections
    ws.on('close', () => {
        console.log('Client disconnected');
    });
});

// GET /rates HTTP handler
const Coinrates = async (req, res) => {
    try {
        const data = await fetchRates();
        res.status(200).json({ status: 'success', data });
    } catch (error) {
        res.status(502).json({ status: 'error', message: error.message });
    }
};

module.exports = Coinrates;
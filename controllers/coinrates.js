const express = require("express");
const axios = require("axios");
const dotenv =  require("dotenv").config();
const router = express.Router();
const WebSocket = require('ws');


const wss = new WebSocket.Server({ port: 8080 });

// Function to fetch data and send updates to clients
const Coinrates = async (req, res) => {
    try {
        const response = await axios.get(process.env.RATES);
        const data = response.data;

        // Log the rates being sent to the client
        console.log('Sending rates to clients:', data);

        // Send data to all connected clients
        wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                const send = client.send(JSON.stringify({ status: 'success', data }));
                console.log('Sent:', send);
            }
        });
    } catch (error) { 
        console.error('Error fetching data:', error.message);
    }
};


// Periodically fetch data and send updates (every 5 seconds in this example)
setInterval(Coinrates, 5000);

// Handle WebSocket connections
wss.on('connection', (ws) => {
    console.log('Client connected');
    Coinrates(ws);
    // Optionally, you can send initial data when a client connects
    // fetchDataAndSendUpdates().then(() => { });

    // Handle WebSocket errors
    ws.on('error', (error) => {
        console.error('WebSocket error:', error);
    });

    // Handle WebSocket disconnections
    ws.on('close', () => {
        console.log('Client disconnected');
    });
});

module.exports = Coinrates;
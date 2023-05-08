const express = require("express");
const dotenv = require("dotenv").config();
const mg = require("mongoose");
const { coinrates } = require("../controllers/coinrates");
const { createwallet } = require("../controllers/wallets/walletcontroller");
const router = express.Router();

router.get("/coinrates",coinrates);
router.post("/createwallet",createwallet);

module.exports = router;
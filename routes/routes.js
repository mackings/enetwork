const express = require("express");
const dotenv = require("dotenv").config();
const mg = require("mongoose");
const { coinrates } = require("../controllers/coinrates");
const { createwallet } = require("../controllers/wallets/walletcontroller");
const { getbalance } = require("../controllers/wallets/balance");
const { Register, login } = require("../controllers/Authentication/auth");
const { verifytoken } = require("../controllers/middlewares");
const router = express.Router();

router.get("/coinrates",coinrates);
router.get("/balance/:wallet",getbalance);
router.post("/createwallet", verifytoken, createwallet);
router.post("/register",Register);
router.post("/login",login);

module.exports = router;
const express = require("express");
const dotenv = require("dotenv").config();
const mg = require("mongoose");
const { coinrates, Gettokenlist } = require("../controllers/coinrates");
const { createwallet } = require("../controllers/wallets/walletcontroller");
const { getbalance } = require("../controllers/wallets/balance");
const { Register, login } = require("../controllers/Authentication/auth");
const { verifytoken } = require("../controllers/middlewares");
const { home } = require("../home,js");
const { Buycoin, Purchase } = require("../controllers/Transactions/buycoins");
const { SellCoins } = require("../controllers/Transactions/sellcoins");
const { Swap, Exchange } = require("../controllers/Transactions/swapcoins");
const { BuyfromSeller } = require("../controllers/Transactions/buytoken");
const router = express.Router();


router.get("/",home);
router.get("/coinrates",coinrates);
router.get("/balance/:wallet",getbalance);
router.get("/tokens",  Gettokenlist);
router.post("/createwallet",  createwallet);
router.post("/register",Register);
router.post("/login",login);

//Transactions
router.post("/sell",Buycoin);
router.get("/purchase/:tokenToBuy",Purchase);
router.post("/BuyToken",SellCoins);
router.post("/BuyfromSeller",BuyfromSeller);
router.post("/exchange",Exchange);

module.exports = router;
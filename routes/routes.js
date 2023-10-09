const express = require("express");
const dotenv = require("dotenv").config();
const mg = require("mongoose");
const { Coinrates, Coinratesbyid } = require("../controllers/coinrates");
const { createwallet } = require("../controllers/wallets/walletcontroller");
const { getbalance } = require("../controllers/wallets/balance");
const { Register, login, addBeneficiary, removeBeneficiary, resetPassword, requestResetToken, Sendsms, CreateVerifyService, SendvCode, Checkvcode } = require("../controllers/Authentication/auth");
const { verifytoken } = require("../controllers/middlewares");
const { home } = require("../home,js");
const { Buycoin, Purchase } = require("../controllers/Transactions/buycoins");
const { SellCoins } = require("../controllers/Transactions/sellcoins");
const { Swap, Exchange } = require("../controllers/Transactions/swapcoins");
const { BuyfromEnet } = require("../controllers/Transactions/buytoken");
const { SellToEnet } = require("../controllers/Transactions/selltoken");
const {getTokenBalance, transferTokensFromUserToOwner } = require("../controllers/Transactions/tokenutils");
const { createSuccessResponse, createErrorResponse } = require('../controllers/Transactions/helper');
const { Sendotp, Verifyotp } = require("../controllers/Authentication/auth");
const { buytk } = require("../controllers/Transactions/buytk");
const { sendTokenTransaction, sendtest } = require("../controllers/Transactions/test");
const { swaptest } = require("../controllers/Transactions/testswap");



const router = express.Router();

//auths

router.post("/register",Register);
router.post("/login",login);
router.post("/sendotp",Sendotp);
router.post("/verifyotp",Verifyotp);
router.post("/resettoken",requestResetToken);
router.post("/resetpass",resetPassword)
router.post("/sendsms",Sendsms);
//twillo
router.post("/createservice",CreateVerifyService);
router.post("/sendvcode",SendvCode);
router.post("/verifyvcode",Checkvcode);

//Transactions
router.get("/",home);
router.get("/balance/:wallet",getbalance);
router.post("/createwallet",  createwallet);
router.post("/send",Buycoin);
router.post("/BuyToken",SellCoins);
router.post("/BuyfromEnet",BuyfromEnet);
router.post("/SellToEnet",SellToEnet);
router.post("/exchange",Exchange);


//Test
router.post("/buytk",buytk);
router.post("/mytest",sendtest);
router.post("/swaptest",swaptest);


//Rates
router.get("/rates",Coinrates);
router.get("/rates/single/:id",Coinratesbyid);

//Beneficiaries
router.post("/addbeneficiary",addBeneficiary);
router.post("/removebeneficiary/:id",removeBeneficiary);

module.exports = router;
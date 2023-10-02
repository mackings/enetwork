const { Web3 } = require('web3');
const { ethers } = require('ethers');
const { ChainId, Token, WETH, Trade, Route, TokenAmount, TradeType, Percent, Fetcher } = require('@uniswap/sdk');
const Wallet = require('ethereumjs-wallet');
const Tx = require('ethereumjs-tx').Transaction;
const Abi = require("../Transactions/abi.json");
const accountAddress = process.env.CONTRACT
const privateKey = process.env.CKEY;



exports.buytk = async (req, res) => {
    try {
      // Initialize Uniswap SDK with the desired network
      const chainId = ChainId.MAINNET; // You can change this to the desired network
      const provider = new ethers.JsonRpcProvider(process.env.INFURA);
      const uniswapRouterAddress = '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D'; // Replace with the actual Uniswap router address
  
      const router = new Route([new Token(chainId, uniswapRouterAddress, 18, 'UNI', 'Uniswap')], WETH[chainId]);
  
      // Example input parameters (replace with user input or fetch user's details)
      const userAddress = req.body.userAddress;
      const amountInEth = req.body.amountInEth; 
      const tokenAddress = req.body.tokenAddress;// Amount to spend in Ether
  
      // Fetch token details and create a Token instance
       // Replace with the ERC-20 token address
      const token = new Token(chainId, tokenAddress, 18, 'TOKEN_SYMBOL', 'Token Name');
  
      // Fetch the current token price from Uniswap
      const pair = await Fetcher.fetchPairData(token, WETH[chainId], provider);
      const route = new Route([pair], WETH[chainId]);
  
      // Calculate the amount of tokens to buy based on the desired spend
      const trade = new Trade(route, new TokenAmount(WETH[chainId], ethers.utils.parseEther(amountInEth.toString())), TradeType.EXACT_INPUT);
  
      // Connect to the user's wallet using their private key
      const wallet = Wallet.fromPrivateKey(Buffer.from(privateKey, 'hex'));
      const userSigner = new ethers.Wallet(privateKey, provider);
  
      // Build the transaction
      const tradeDeadline = Math.floor(Date.now() / 1000) + 60 * 20; // 20 minutes
      const uniswapRouter = new ethers.Contract(uniswapRouterAddress, Abi, userSigner);
      const tx = await uniswapRouter.populateTransaction.swapExactTokensForTokens(
        ethers.utils.parseEther(amountInEth.toString()), // Amount in Wei
        trade.minimumAmountOut(Percent.fromPercent(50)).raw, // Minimum tokens expected
        [WETH[chainId].address, token.address], // Path for swapping
        userAddress,
        tradeDeadline 
      );
  
      // Sign and send the transaction
      const txData = {
        nonce: await provider.getTransactionCount(wallet.getAddressString(), 'latest'),
        gasLimit: ethers.utils.hexlify(200000), // Set an appropriate gas limit
        gasPrice: ethers.utils.hexlify(await provider.getGasPrice()),
        to: uniswapRouterAddress,
        value: '0x00',
        data: tx.data,
      };
  
      const signedTx = wallet.signTransaction(txData);
      const txHash = await provider.sendTransaction(signedTx);
  
      res.status(200).json(createSuccessResponse('Transaction sent successfully', { txHash }));
    } catch (error) {
      console.error('Error buying tokens:', error);
      res.status(500).json(createErrorResponse('An error occurred while buying tokens', error));
    }
  };
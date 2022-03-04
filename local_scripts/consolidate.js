const { ethers } = require("ethers");
const {utils, BigNumber} = require('ethers');

const USDTContractAddress = '0xdac17f958d2ee523a2206206994597c13d831ec7';
const USDCContractAddress = '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48';
const to_address = '0x3A9F87759bF38E9AEA130a111F01ba258A4F369D';

const abi = [
  {
    name: 'balanceOf',
    type: 'function',
    inputs: [
      {
        name: '_owner',
        type: 'address',
      },
    ],
    outputs: [
      {
        name: 'balance',
        type: 'uint256',
      },
    ],
    constant: true,
    payable: false,
  },
];

let provider = new ethers.providers.EtherscanProvider("homestead", "2AM5WWGB2DMMJRSIUV13DU6ZPA6E1EK583");

// account wallet
const wallet_default = ethers.Wallet.fromMnemonic('brand culture bid loop traffic unfold item butter inmate nominee south program',"m/44'/60'/0'/0/2");
const address_default = wallet_default.address
const privkey_default = wallet_default.privateKey
let wallet_defaultSigner = wallet_default.connect(provider);

var ETH = 0;
var USDT = 0;
var USDC = 0;

// sendETH(wallet_defaultSigner,'0x1fb7f4782c83d9a240F5e0Efa072789afD14AA44');
 sendERC20(USDCContractAddress, wallet_defaultSigner,'0x3A9F87759bF38E9AEA130a111F01ba258A4F369D');

// for (let path = 600; path < 620; path++) {
//   const wallet = ethers.Wallet.fromMnemonic('brand culture bid loop traffic unfold item butter inmate nominee south program',"m/44'/60'/0'/0/"+path);
//   const address = wallet.address
//   const privkey = wallet.privateKey
//   getBalances(wallet,address,path);
//   wait(3000);
// }

async function sendETH(wallet, receiverAddress){
  let gasPrice = await provider.getGasPrice();

  let tx = {
    to: receiverAddress,
    value: ethers.utils.parseEther("0.05"),
    gasPrice: gasPrice
  }

  wallet.sendTransaction(tx).then((txObj)=>{
    console.log('txHash', txObj.hash)
  });
}

async function sendERC20(contractAddress, wallet, targetAddress){
  var fromAddress = wallet.address;
  let gasprice = await provider.getGasPrice();
  var contractAbiFragment = [
    {
        "name" : "transfer",
        "type" : "function",
        "inputs" : [
          {
              "name" : "_to",
              "type" : "address"
          },
          {
              "type" : "uint256",
              "name" : "_tokens"
          }
        ],
        "constant" : false,
        "outputs" : [],
        "payable" : false
    }
  ];
  var contract = new ethers.Contract(contractAddress, contractAbiFragment, wallet);

  var numberOfTokens = ethers.utils.parseUnits('23000', 6);
  var options = {gasPrice: gasprice };

  // Send tokens
  contract.transfer(targetAddress, numberOfTokens,options).then(function(tx) {
      console.log(tx);
  });

}


async function getBalances(wallet,address,path){
  let wallet_signer = wallet.connect(provider);
  const ethBalance = wallet_signer.getBalance().then((bal) => {
    let ethBal = parseFloat(utils.formatEther(bal));
    let usdtBal = getERC20Balance(USDTContractAddress,address).then((usdtbal) => {
      let usdcBal = getERC20Balance(USDCContractAddress,address).then((usdcbal) => {
        console.log(path,address,ethBal,usdtbal/1000000,usdcbal/1000000);
      });
    });    
  }).catch((error) => {
      console.error(error);
  });
}

async function getERC20Balance(contractAddress, address){
  let balance = 0;
  const contract = new ethers.Contract(contractAddress, abi, provider);
  const erc20Balance = await contract.balanceOf(address).then((bal) => {
    balance = bal.toNumber();
    return balance;
  });
  return balance;
}

function wait(ms){
  var start = new Date().getTime();
  var end = start;
  while(end < start + ms) {
    end = new Date().getTime();
 }
}




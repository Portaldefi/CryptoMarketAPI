// const { ethers } = require("ethers");
// const USDTContractAddress = '0x...';
// const USDCContractAddress = '0x...';
// const to_address = '';

// let provider = ethers.getDefaultProvider('homestead');

// // account wallet
// const wallet_default = ethers.Wallet.fromMnemonic('dumb cinnamon order suspect tree predict quick news media cart tail moon',"m/44'/60'/0'/0/1");
// const address_default = wallet_default.address
// const privkey_default = wallet_default.privateKey
// let wallet_defaultSigner = wallet_default.connect(provider);

// // ingest seed words 
// const wallet = ethers.Wallet.fromMnemonic('dumb cinnamon order suspect tree predict quick news media cart tail moon',"m/44'/60'/0'/0/2");
// const address = wallet.address
// const privkey = wallet.privateKey
// connectToMetamask();

// async function connectToMetamask(){
//     const ethBalance = wallet.getBalance().then((bal) => {
//         console.log("ETH Balance",bal);
//       }).catch((error) => {
//         console.error(error);
//       });
//     // const usdt_contract = new wallet.Contract(USDTContractAddress, genericErc20Abi, provider);
//     // const usdtBalance = (await usdt_contract.balanceOf((await provider.getSigners())[0].address)).toString();

//     // const usdc_contract = new wallet.Contract(USDCContractAddress, genericErc20Abi, provider);
//     // const usdcBalance = (await usdc_contract.balanceOf((await provider.getSigners())[0].address)).toString();
    
//     // console.log("ETH BAL", address,ethBalance,usdcBalance,usdtBalance)
// }
// // tx = {
// //     to: address,
// //     value: ethers.utils.parseEther("0.05"),
// //     gasLimit: ethers.utils.hexlify(gas_limit), // 100000,
// //     gasPrice: "0x07f9acf02",
// //     nonce: window.ethersProvider.getTransactionCount(address, "latest")
// //   }
  
// //   wallet_default.signTransaction(tx).then((signedTX)=>{
// //       customHttpProvider.sendTransaction(signedTX).then(console.log);
// //   });




// // const usdt_tx = {
// //     from: address,
// //     to: to_address,
// //     value: ethers.utils.parseEther(usdtBalance),
// //     nonce: window.ethersProvider.getTransactionCount(address, "latest"),
// //     gasLimit: ethers.utils.hexlify(gas_limit), // 100000
// //     gasPrice: gas_price,
// // }

// // const usdc_tx = {
// //     from: address,
// //     to: to_address,
// //     value: ethers.utils.parseEther(usdcBalance),
// //     nonce: window.ethersProvider.getTransactionCount(address, "latest"),
// //     gasLimit: ethers.utils.hexlify(gas_limit), // 100000
// //     gasPrice: gas_price,
// // }

// // let walletSigner = wallet.connect(provider);

// // walletSigner.sendTransaction(usdt_tx).then((transaction) => {
// //     console.dir(transaction)
// //     alert("Send finished!")
// // });

// // walletSigner.sendTransaction(usdc_tx).then((transaction) => {
// //     console.dir(transaction)
// //     alert("Send finished!")
// // });

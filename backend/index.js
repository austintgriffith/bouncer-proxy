"use strict";
const EventParser = require('./modules/eventParser.js');
const LiveParser = require('./modules/liveParser.js');
const express = require('express');
const helmet = require('helmet');
const app = express();
const fs = require('fs');
const Redis = require('ioredis');
const ContractLoader = require('./modules/contractLoader.js');
var bodyParser = require('body-parser')
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(helmet());
var cors = require('cors')
app.use(cors())
let contracts;
let tokens = [];
var Web3 = require('web3');
var web3 = new Web3();
web3.setProvider(new web3.providers.HttpProvider('http://0.0.0.0:8545'));

const DESKTOPMINERACCOUNT = 3 //index in geth

let accounts
web3.eth.getAccounts().then((_accounts)=>{
  accounts=_accounts
  console.log("ACCOUNTS",accounts)
})

const NETWORK = parseInt(fs.readFileSync("../deploy.network").toString().trim())
if(!NETWORK){
  console.log("No deploy.network found exiting...")
  process.exit()
}
console.log("NETWORK:",NETWORK)

let transactionListKey = "transactionList"+NETWORK


let redisHost = 'localhost'
let redisPort = 57300
if(NETWORK>0&&NETWORK<9){
 redisHost = 'cryptogsnew.048tmy.0001.use2.cache.amazonaws.com'
 redisPort = 6379
}
let redis = new Redis({
  port: redisPort,
  host: redisHost,
})

console.log("LOADING CONTRACTS")
contracts = ContractLoader(["BouncerProxy","Example"],web3);



//my local geth node takes a while to spin up so I don't want to start parsing until I'm getting real data
function checkForGeth() {
  contracts["Example"].methods.count().call({}, function(error, result){
      console.log("COUNT",error,result)
      if(error){
        setTimeout(checkForGeth,15000);
      }else{
        startParsers()
      }
  });
}
checkForGeth()

function startParsers(){
  web3.eth.getBlockNumber().then((blockNumber)=>{
    //parsers here
    //
    //

    setInterval(()=>{
      console.log("::: TX CHECKER :::: loading transactions from cache...")
      redis.get(transactionListKey, async (err, result) => {
        let transactions
        try{
          transactions = JSON.parse(result)
        }catch(e){contracts = []}
        if(!transactions) transactions = []
        console.log("current transactions:",transactions.length)
        for(let t in transactions){
          console.log("Check Tx:",transactions[t].sig)
          let contract = new web3.eth.Contract(contracts.BouncerProxy._jsonInterface,transactions[t].parts[0])
          let ready = await contract.methods.isValidSigAndBlock(transactions[t].sig,transactions[t].parts[1],transactions[t].parts[2],transactions[t].parts[3],transactions[t].parts[4],transactions[t].parts[5],transactions[t].parts[6],transactions[t].parts[7]).call()
          if(ready){
            console.log("Transaction is READY ---> ")
            doTransaction(contract,transactions[t])
            removeTransaction(transactions[t].sig)
          }
        }
      });
    },5000)

  })
}

function removeTransaction(sig){
  redis.get(transactionListKey, function (err, result) {
    let transactions
    try{
      transactions = JSON.parse(result)
    }catch(e){transactions = []}
    if(!transactions) transactions = []
    let newtransactions = []
    for(let t in transactions){
      if(transactions[t].sig!=sig){
        newtransactions.push(transactions[t])
      }
    }
    redis.set(transactionListKey,JSON.stringify(newtransactions),'EX', 60 * 60 * 24 * 7);
  });
}

app.get('/clear', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  console.log("/clear")
  res.set('Content-Type', 'application/json');
  res.end(JSON.stringify({hello:"world"}));
  redis.set(transactionListKey,JSON.stringify([]),'EX', 60 * 60 * 24 * 7);
});

app.get('/', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  console.log("/")
  res.set('Content-Type', 'application/json');
  res.end(JSON.stringify({hello:"world"}));

});

app.get('/miner', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  console.log("/miner")
  res.set('Content-Type', 'application/json');
  res.end(JSON.stringify({address:accounts[DESKTOPMINERACCOUNT]}));

});

app.get('/sigs/:contract', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  console.log("/sigs/"+req.params.contract)
  let sigsKey = req.params.contract+"sigs"
  redis.get(sigsKey, function (err, result) {
    res.set('Content-Type', 'application/json');
    res.end(result);
  })

});

app.get('/contracts', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  console.log("/contracts")
  let deployedContractsKey = "deployedcontracts"+NETWORK
  redis.get(deployedContractsKey, function (err, result) {
    res.set('Content-Type', 'application/json');
    res.end(result);
  })

});

app.get('/transactions', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  console.log("/transactions")
  redis.get(transactionListKey, function (err, result) {
    res.set('Content-Type', 'application/json');
    res.end(result);
  })
});

app.post('/sign', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  console.log("/sign",req.body)
  let account = web3.eth.accounts.recover(req.body.message,req.body.sig)
  console.log("RECOVERED:",account)
  if(account.toLowerCase()==req.body.account.toLowerCase()){
    console.log("Correct sig... log them into the contract...")
    let sigsKey = req.body.address+"sigs"
    redis.get(sigsKey, function (err, result) {
      let sigs
      try{
        sigs = JSON.parse(result)
      }catch(e){sigs = []}
      if(!sigs) sigs = []
      console.log("current sigs:",sigs)
      if(sigs.indexOf(req.body.account.toLowerCase())<0){
        sigs.push(req.body.account.toLowerCase())
        console.log("saving sigs:",sigs)
        redis.set(sigsKey,JSON.stringify(sigs),'EX', 60 * 60 * 24 * 7);
      }
    });
  }
  res.set('Content-Type', 'application/json');
  res.end(JSON.stringify({hello:"world"}));
});

app.post('/deploy', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  console.log("/deploy",req.body)
  let contractAddress = req.body.contractAddress
  let deployedContractsKey = "deployedcontracts"+NETWORK
  redis.get(deployedContractsKey, function (err, result) {
    let contracts
    try{
      contracts = JSON.parse(result)
    }catch(e){contracts = []}
    if(!contracts) contracts = []
    console.log("current contracts:",contracts)
    if(contracts.indexOf(contractAddress)<0){
      contracts.push(contractAddress)
    }
    console.log("saving contracts:",contracts)
    redis.set(deployedContractsKey,JSON.stringify(contracts),'EX', 60 * 60 * 24 * 7);
    res.set('Content-Type', 'application/json');
    res.end(JSON.stringify({contract:contractAddress}));
  });
})

app.post('/tx', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  console.log("/tx",req.body)
  let account = web3.eth.accounts.recover(req.body.message,req.body.sig)
  console.log("RECOVERED:",account)
  if(account.toLowerCase()==req.body.parts[1].toLowerCase()){
    console.log("Correct sig... relay transaction to contract... might want more filtering here, but just blindly do it for now")
    redis.get(transactionListKey, function (err, result) {
      let transactions
      try{
        transactions = JSON.parse(result)
      }catch(e){contracts = []}
      if(!transactions) transactions = []
      console.log("current transactions:",transactions)
      transactions.push(req.body)
      console.log("saving transactions:",transactions)
      redis.set(transactionListKey,JSON.stringify(transactions),'EX', 60 * 60 * 24 * 7);
    });
  }
  res.set('Content-Type', 'application/json');
  res.end(JSON.stringify({hello:"world"}));
});

app.listen(10001);
console.log(`http listening on 10001`);


function doTransaction(contract,txObject){
  //console.log(contracts.BouncerProxy)

  console.log("Forwarding tx to ",contract._address," with local account ",accounts[3])
  let txparams = {
    from: accounts[DESKTOPMINERACCOUNT],
    gas: txObject.gas,
    gasPrice:Math.round(4 * 1000000000)
  }

  //const result = await clevis("contract","forward","BouncerProxy",accountIndexSender,sig,accounts[accountIndexSigner],localContractAddress("Example"),"0",data,rewardAddress,reqardAmount)
  console.log("TX",txObject.sig,txObject.parts[1],txObject.parts[2],txObject.parts[3],txObject.parts[4],txObject.parts[5],txObject.parts[6],txObject.parts[7])
  console.log("PARAMS",txparams)
  contract.methods.forward(txObject.sig,txObject.parts[1],txObject.parts[2],txObject.parts[3],txObject.parts[4],txObject.parts[5],txObject.parts[6],txObject.parts[7]).send(
  txparams ,(error, transactionHash)=>{
    console.log("TX CALLBACK",error,transactionHash)
  })
  .on('error',(err,receiptMaybe)=>{
    console.log("TX ERROR",err,receiptMaybe)
  })
  .on('transactionHash',(transactionHash)=>{
    console.log("TX HASH",transactionHash)
  })
  .on('receipt',(receipt)=>{
    console.log("TX RECEIPT",receipt)
  })
  /*.on('confirmation', (confirmations,receipt)=>{
    console.log("TX CONFIRM",confirmations,receipt)
  })*/
  .then((receipt)=>{
    console.log("TX THEN",receipt)
  })
}

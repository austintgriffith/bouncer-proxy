"use strict";
const express = require('express');
const helmet = require('helmet');
const app = express();
const fs = require('fs');
const ContractLoader = require('./modules/contractLoader.js');
var RLP = require('rlp');
const Room = require('ipfs-pubsub-room')
const IPFS = require('ipfs')
const ipfs = new IPFS({
  repo: './ipfs',
  EXPERIMENTAL: {
    pubsub: true
  },
  config: {
    Addresses: {
      Swarm: [
        '/dns4/ws-star.discovery.libp2p.io/tcp/443/wss/p2p-websocket-star'
      ]
    }
  }
})

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

const IPFSROOMNAME = "ethsf-meta-connect"

let accounts
web3.eth.getAccounts().then((_accounts)=>{
  accounts=_accounts
  console.log("ACCOUNTS",accounts)
})

console.log("LOADING CONTRACTS")
contracts = ContractLoader(["MetaConnect"],web3);

//my local geth node takes a while to spin up so I don't want to start parsing until I'm getting real data
function checkForGeth() {
  contracts["MetaConnect"].methods.purpose().call({}, function(error, result){
      console.log("COUNT",error,result)
      if(error){
        setTimeout(checkForGeth,60000);
      }else{
        startParsers()
      }
  });
}
checkForGeth()

function startParsers(){
  web3.eth.getBlockNumber().then((blockNumber)=>{
    //parsers here
  })
}

app.post('/connect', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  console.log("/connect",req.body)

  let txparams = {
    from: accounts[DESKTOPMINERACCOUNT],
    gas: 120000,
    gasPrice:Math.round(4 * 1000000000)
  }

  console.log("NO EXISTING TX, DOING TX")
  //const result = await clevis("contract","forward","BouncerProxy",accountIndexSender,sig,accounts[accountIndexSigner],localContractAddress("Example"),"0",data,rewardAddress,reqardAmount)
  console.log("TX",req.body[0],req.body[1],req.body[3],req.body[2],req.body[4])
  console.log("PARAMS",txparams)
  //metaConnect(bytes32 handle1, uint256 timestamp, bytes32 handle2, bytes sig1, bytes sig2)
  contracts["MetaConnect"].methods.metaConnect(req.body[0],req.body[1],req.body[3],req.body[2],req.body[4]).send(
    txparams ,(error, transactionHash)=>{
      console.log("TX CALLBACK",error,transactionHash)

    }
  )
  .on('error',(err,receiptMaybe)=>{
    console.log("TX ERROR",err,receiptMaybe)
  })
  .on('transactionHash',(transactionHash)=>{
    console.log("TX HASH",transactionHash)
  })
  .on('receipt',(receipt)=>{
    console.log("TX RECEIPT",receipt)
  })
  .then((receipt)=>{
    console.log("TX THEN",receipt)
  })


  res.set('Content-Type', 'application/json');
  res.end(JSON.stringify({hello:"world"}));
});

ipfs.on('ready', () => {
  const room = Room(ipfs,IPFSROOMNAME)

  const ipfsMiners = Room(ipfs,IPFSROOMNAME+"Miners")
  setInterval(()=>{
    console.log("Checking in...")
    ipfsMiners.broadcast(JSON.stringify({address:accounts[DESKTOPMINERACCOUNT]}))
  },15000)

  ipfsMiners.on('peer joined ipfsMiners', (peer) => {
    console.log('Peer joined the room', peer)
    ipfsMiners.sendTo(peer, JSON.stringify({address:accounts[DESKTOPMINERACCOUNT]}))
  })

  room.on('peer left', (peer) => {
    console.log('Peer left...', peer)
  })

  // now started to listen to room
  room.on('subscribed', () => {
    console.log('Now connected!')
  })

  room.on('message', async (message) => {

    console.log("message:",message)
    let metaTxData = JSON.parse(message.data)
    console.log(metaTxData)
    console.log("/tx",metaTxData)
    let account = web3.eth.accounts.recover(metaTxData.message,metaTxData.sig)
    console.log("RECOVERED:",account)
    if(account.toLowerCase()==metaTxData.parts[1].toLowerCase()){
      console.log("Correct sig... relay transaction to contract... might want more filtering here, but just blindly do it for now")

      //console.log(contracts.BouncerProxy)
      let contract = new web3.eth.Contract(contracts.BouncerProxy._jsonInterface,metaTxData.parts[0])
      console.log("Forwarding tx to ",contract._address," with local account ",accounts[3])

      let txparams = {
        from: accounts[DESKTOPMINERACCOUNT],
        gas: metaTxData.gas,
        gasPrice:Math.round(4 * 1000000000)
      }
      //first get the hash to see if there is already a tx in motion
      // let hash = await contract.methods.getHash(metaTxData.parts[1],metaTxData.parts[2],metaTxData.parts[3],metaTxData.parts[4],metaTxData.parts[5],metaTxData.parts[6]).call()
      // console.log("HASH:",hash)
      //
      //
      // console.log("NO EXISTING TX, DOING TX")
      // //const result = await clevis("contract","forward","BouncerProxy",accountIndexSender,sig,accounts[accountIndexSigner],localContractAddress("Example"),"0",data,rewardAddress,reqardAmount)
      // console.log("TX",metaTxData.sig,metaTxData.parts[1],metaTxData.parts[2],metaTxData.parts[3],metaTxData.parts[4],metaTxData.parts[5],metaTxData.parts[6])
      // console.log("PARAMS",txparams)
      // contract.methods.forward(metaTxData.sig,metaTxData.parts[1],metaTxData.parts[2],metaTxData.parts[3],metaTxData.parts[4],metaTxData.parts[5],metaTxData.parts[6]).send(
      //   txparams ,(error, transactionHash)=>{
      //     console.log("TX CALLBACK",error,transactionHash)
      //
      //   }
      // )
      // .on('error',(err,receiptMaybe)=>{
      //   console.log("TX ERROR",err,receiptMaybe)
      // })
      // .on('transactionHash',(transactionHash)=>{
      //   console.log("TX HASH",transactionHash)
      // })
      // .on('receipt',(receipt)=>{
      //   console.log("TX RECEIPT",receipt)
      // })
      // .then((receipt)=>{
      //   console.log("TX THEN",receipt)
      // })

    }
  })
})


app.listen(10005);
console.log(`http listening on 10005`);
/*
app.post('/tx', async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.set('Content-Type', 'application/json');
  res.end(JSON.stringify({hello:"world"}));
});
app.listen(10001);
console.log(`http listening on 10001`);
*/

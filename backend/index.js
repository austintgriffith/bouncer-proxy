"use strict";
const EventParser = require('./modules/eventParser.js');
const LiveParser = require('./modules/liveParser.js');
const express = require('express');
const helmet = require('helmet');
const app = express();
const fs = require('fs');
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
console.log("LOADING CONTRACTS")
contracts = ContractLoader(["Example"],web3);

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
  })
}



app.get('/', (req, res) => {
  console.log("/")
  res.set('Content-Type', 'application/json');
  res.end(JSON.stringify({hello:"world"}));

});

app.listen(10001);
console.log(`http listening on 10001`);

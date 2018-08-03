import React, { Component } from 'react';
import { Metamask, Gas, ContractLoader, Transactions, Events, Scaler, Blockie, Address } from "dapparatus"
import Web3 from 'web3';
import './App.css';
import Owner from "./components/owner.js"
import Bouncer from "./components/bouncer.js"
import Backend from "./components/backend.js"
import Miner from "./components/miner.js"
import QRCode from 'qrcode.react';

let backendUrl = "http://localhost:10001/"
console.log("window.location:",window.location)
if(window.location.href.indexOf("metatx.io")>=0)
{
  backendUrl = "https://backend.metatx.io/"
}

class App extends Component {
  constructor(props) {
   super(props);
   this.state = {
     web3: false,
     account: false,
     gwei: 4,
     address: window.location.pathname.replace("/",""),
     contract: false,
     owner: "",
     bouncer: ""
   }
  }
  deployBouncerProxy() {
    let {web3,tx,contracts} = this.state
    console.log("Deploying bouncer...")
    let code = require("./contracts/BouncerProxy.bytecode.js")
    tx(contracts.BouncerProxy._contract.deploy({data:code}),1220000)
  }
  updateBouncer(value){
    console.log("UPDATE BOUNCER",value)
    this.setState({bouncer:value})
  }
  render() {
    let {web3,account,contracts,tx,gwei,block,avgBlockTime,etherscan} = this.state

    let metamask = (
      <Metamask
        config={{requiredNetwork:['Unknown','Rinkeby']}}
        onUpdate={(state)=>{
          console.log("metamask state update:",state)
          if(state.web3Provider) {
            state.web3 = new Web3(state.web3Provider)
            this.setState(state)
          }
        }}
      />
    )

    let connectedDisplay = ""
    let events = ""
    if(web3){
      connectedDisplay = (
        <div>
          <ContractLoader
            config={{DEBUG:true}}
            web3={web3}
            require={path => {return require(`${__dirname}/${path}`)}}
            onReady={(contracts,customLoader)=>{
              console.log("contracts loaded",contracts)
              this.setState({contracts:contracts},async ()=>{
                if(this.state.address){
                  console.log("Loading dyamic contract "+this.state.address)
                  let dynamicContract = customLoader("BouncerProxy",this.state.address)//new this.state.web3.eth.Contract(require("./contracts/BouncerProxy.abi.js"),this.state.address)
                  let owner = await dynamicContract.owner().call()
                  this.setState({contract:dynamicContract,owner:owner})
                }
              })
            }}
          />
          <Transactions
            config={{DEBUG:false}}
            account={account}
            gwei={gwei}
            web3={web3}
            block={block}
            avgBlockTime={avgBlockTime}
            etherscan={etherscan}
            onReady={(state)=>{
              console.log("Transactions component is ready:",state)
              this.setState(state)
            }}
            onReceipt={(transaction,receipt)=>{
              console.log("Transaction Receipt",transaction,receipt)
              if(receipt.contractAddress){
                window.location = "/"+receipt.contractAddress
              }
            }}
          />
          <Gas
            onUpdate={(state)=>{
              console.log("Gas price update:",state)
              this.setState(state,()=>{
                console.log("GWEI set:",this.state)
              })
            }}
          />
        </div>
      )
    }

    let deployButton = ""
    let contractDisplay = ""
    let qr = ""
    let backend = ""

    if(web3 && contracts){
      if(!this.state.address){
        deployButton = (
          <div className={"button"} onClick={this.deployBouncerProxy.bind(this)}> DEPLOY </div>
        )
      }else if(this.state.contract){

        qr = (
          <div style={{position:"fixed",top:100,right:20}}>
            <QRCode value={window.location.toString()} />
          </div>
        )

        backend = (
          <Backend
            {...this.state}
            backendUrl={backendUrl}
            updateBouncer={this.updateBouncer.bind(this)}
          />
        )

        let userDisplay = ""
        if(this.state.owner.toLowerCase()==this.state.account.toLowerCase()){

          userDisplay = (
            <div>
              <Owner
                {...this.state}
                onUpdate={(bouncerUpdate)=>{
                  console.log("bouncerUpdate",bouncerUpdate)
                  this.setState(bouncerUpdate)
                }}
                updateBouncer={this.updateBouncer.bind(this)}
              />
            </div>
          )
        }else{
          userDisplay = (
            <div>
              <Bouncer
                {...this.state}
                backendUrl={backendUrl}
              />
            </div>
          )
        }

        contractDisplay = (
          <div style={{padding:20}}>
            <Miner backendUrl={backendUrl} {...this.state} />
            <h2>BouncerProxy</h2>
            <div>
              <Address
                {...this.state}
                address={this.state.contract._address}
              />
            </div>
            <div>
              <Address
                {...this.state}
                address={this.state.owner}
              />
            </div>
            {userDisplay}
          </div>
        )
      }else{
        contractDisplay = (
          <div style={{padding:20}}>
            Connecting to {this.state.address}
          </div>
        )
      }
    }else{
      contractDisplay = (
        <div style={{padding:20}}>
          Bouncer Proxy needs web3 ---->
        </div>
      )
    }

    return (
      <div className="App">
        {metamask}
        {connectedDisplay}
        {events}
        {deployButton}
        {contractDisplay}
        {qr}
        {backend}

      </div>
    );
  }
}

export default App;

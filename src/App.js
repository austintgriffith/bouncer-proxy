import React, { Component } from 'react';
import cookie from 'react-cookies'
import './App.css';
import { Dapparatus, Metamask, Gas, ContractLoader, Transactions, Events, Scaler, Blockie, Address, Button } from "dapparatus"
import Web3 from 'web3';
import EthCrypto from 'eth-crypto';
import axios from 'axios';

var QRCode = require('qrcode.react');
const queryString = require('query-string');

let backendUrl = "http://metatx.me:10005/"

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
const IPFSROOMNAME = "ethsf-meta-connect"

const METATX = {
  //endpoint:"http://0.0.0.0:10001/",
  //contract:"0xf5bf6541843D2ba2865e9aeC153F28aaD96F6fbc",
  //accountGenerator: "//account.metatx.io",
}
const WEB3_PROVIDER = 'http://metatx.me:8545'
//const WEB3_PROVIDER = 'https://rinkeby.infura.io/v3/b83784c3e679479a867520aa047f1532'

const DOMAIN = "http://metatx.me:3000"

class App extends Component {
  constructor(props) {
    let queryParams = queryString.parse(window.location.search)

    let handle = cookie.load('handle')
    if(!handle) handle = handle=queryParams.handle
    console.log("query",queryParams)
    super(props);
    this.state = {
      web3: false,
      account: false,
      gwei: 4,
      doingTransaction: false,
      url: "",
      query: queryParams,
      handle: handle,
      handle1: queryParams.handle1,
      timestamp1: queryParams.timestamp1,
      sig1: queryParams.sig1,
      ipfs: Room(ipfs,IPFSROOMNAME),
    }
    console.log("State starts as",this.state)
  }
  componentDidMount(){
    console.log("mount")
      this.poll()
      setInterval(this.poll.bind(this),5000)
      this.handleInput({target:"none"})
  }
  async poll(){
    console.log("poll")
    this.setState({timestamp: Date.now()},()=>{
      this.handleInput({target:"none"})
    })
  }
  handleInput(e){
    let update = {}
    update[e.target.name] = e.target.value
    this.setState(update,async ()=>{
      if(this.state.contracts){
        console.log("SETSTATE!",this.state)

        if(!this.state.handle) {
          //wiaitng for input
        } else if(this.state.handle1 && this.state.timestamp1 && this.state.sig1 && this.state.handle) {
          console.log("hash2",this.state.web3.utils.toHex(this.state.handle1),this.state.timestamp1,this.state.sig1,this.state.web3.utils.toHex(this.state.handle))
          //getHash2(bytes32 handle1, uint256 timestamp, bytes sig1, bytes32 handle2)
          let hash2 = await this.state.contracts.MetaConnect.getHash2(this.state.web3.utils.toHex(this.state.handle1),this.state.timestamp1,this.state.sig1,this.state.web3.utils.toHex(this.state.handle)).call()
          console.log("hash2",hash2)

          const signature = EthCrypto.sign(cookie.load('metaPrivateKey'), hash2);
          console.log("signature",signature)
          //this.setState({url})
          let arrayData = [this.state.web3.utils.toHex(this.state.handle1),this.state.timestamp1,this.state.sig1,this.state.web3.utils.toHex(this.state.handle),signature]
          console.log("broadcast",arrayData)
          //this.state.ipfs.broadcast(JSON.stringify(arrayData))
          axios.post(backendUrl+'connect', arrayData, {
              headers: {
                  'Content-Type': 'application/json',
              }
            }).then((response)=>{
              console.log("TX RESULT",response)
              window.location = "/"
            })
            .catch((error)=>{
              console.log(error);
            });
        } else   if(this.state.handle && this.state.timestamp){
          console.log("hash1",this.state.handle,this.state.timestamp)
          let hash1 = await this.state.contracts.MetaConnect.getHash1(this.state.web3.utils.toHex(this.state.handle),this.state.timestamp).call()
          console.log("hash1",hash1)
          const signature = EthCrypto.sign(cookie.load('metaPrivateKey'), hash1);
          console.log("signature",signature)
          let url = "/?handle1="+this.state.handle+"&timestamp1="+this.state.timestamp+"&sig1="+signature
          this.setState({url})
        }


      }
    })
  }
  render() {
    let {web3,account,contracts,tx,gwei,block,avgBlockTime,etherscan} = this.state
    let connectedDisplay = []
    let contractsDisplay = []
    if(web3){
      connectedDisplay.push(
       <Gas
         key="Gas"
         onUpdate={(state)=>{
           console.log("Gas price update:",state)
           this.setState(state,()=>{
             console.log("GWEI set:",this.state)
           })
         }}
       />
      )

      connectedDisplay.push(
        <ContractLoader
         key="ContractLoader"
         config={{DEBUG:true}}
         web3={web3}
         require={path => {return require(`${__dirname}/${path}`)}}
         onReady={(contracts,customLoader)=>{
           console.log("contracts loaded",contracts)
           this.setState({contracts:contracts},async ()=>{
             console.log("Contracts Are Ready:",this.state.contracts)
             let purpose = await this.state.contracts.MetaConnect.purpose().call()
             console.log("PURPOSE",purpose)

           })
         }}
        />
      )
      connectedDisplay.push(
        <Transactions
          key="Transactions"
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
            // this is one way to get the deployed contract address, but instead I'll switch
            //  to a more straight forward callback system above
            console.log("Transaction Receipt",transaction,receipt)
          }}
        />
      )

      if(contracts){
        if(this.state.handle){
          contractsDisplay.push(
            <div key="UI" style={{padding:30}}>
              handle: {this.state.handle}
              timestamp: {this.state.timestamp}
              <div>
                 <QRCode size={256} value={DOMAIN+this.state.url} />
              </div>
              {DOMAIN+this.state.url}

            </div>
          )
        }else{
          const expires = new Date()
          expires.setDate(expires.getDate() + 365)
          contractsDisplay.push(
            <div key="UI" style={{padding:30}}>
            handle: <input
                style={{verticalAlign:"middle",width:200,margin:6,maxHeight:20,padding:5,border:'2px solid #ccc',borderRadius:5}}
                type="text" name="editHandle" value={this.state.editHandle} onChange={this.handleInput.bind(this)}
            />
            <div>
            <Button size="2" style={{}} onClick={async ()=>{
              this.setState({handle:this.state.editHandle})
              cookie.save('handle', this.state.editHandle, { path: '/',expires})
              if(this.state.handle1 && this.state.timestamp1){

                console.log("LOADING HASH!",this.state.handle1,this.state.timestamp1)
                let hash1 = await this.state.contracts.MetaConnect.getHash1(this.state.web3.utils.toHex(this.state.handle1),this.state.timestamp1).call()
                console.log("hash1:",hash1)
                let hash2 = await this.state.contracts.MetaConnect.getHash1(this.state.web3.utils.toHex(this.state.handle1),this.state.timestamp1).call()

                //tx(
                  //this.state.MetaConnect()
                //)
              }
            }}>
                  MetaConneeeeeect!
            </Button>
            </div>

            </div>
          )
        }

      }

    }
    return (
      <div className="App">

        <Dapparatus
          config={{
            DEBUG:false,
            requiredNetwork:['Unknown','Rinkeby'],
          }}
          metatx={METATX}
          fallbackWeb3Provider={new Web3.providers.HttpProvider(WEB3_PROVIDER)}
          //fallbackWeb3Provider={new Web3.providers.WebsocketProvider('ws://rinkeby.infura.io/ws')}
          onUpdate={(state)=>{
           console.log("metamask state update:",state)
           if(state.web3Provider) {
             state.web3 = new Web3(state.web3Provider)
             this.setState(state)
           }
          }}
        />

        {connectedDisplay}
        {contractsDisplay}
      </div>
    );
  }
}

export default App;

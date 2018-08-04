import React, { Component } from 'react';
import { Metamask, Gas, ContractLoader, Transactions, Events, Scaler, Blockie } from "dapparatus"
import { soliditySha3 } from 'web3-utils';
import axios from 'axios';

let pollInterval
let pollTime = 509

class Bouncer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      count: "loading...",
      gasLimit: 120000
    }
  }
  handleInput(e){
    let update = {}
    update[e.target.name] = e.target.value
    this.setState(update)
  }
  componentDidMount(){
    pollInterval = setInterval(this.loadCount.bind(this),pollTime)
    this.loadCount()
  }
  componentWillUnmount(){
    clearInterval(pollInterval)
  }
  async loadCount(){
    let {contracts} = this.props
    let result = await contracts.Example.count().call()
    this.setState({count:result})
  }
  addAmountMeta(){
    let {contracts,contract,account} = this.props
    var data = contracts.Example.addAmount(5).encodeABI()
    console.log("DATA:",data)
    this.sendMetaTx(contract._address,account,contracts.Example._address,0,data)
  }
  sendEther(){
    let {contract,account,web3} = this.props
    const wei = web3.utils.toWei(this.state.sendEther+"", 'ether')
    console.log("SENDING WEI:",wei)
    this.setState({sendEther:"",toAddress:""})
    this.sendMetaTx(contract._address,account,this.state.toAddress,wei,"0x00")
  }
  async sendToken(){
    let {contracts,contract,account,web3} = this.props
    var data = contracts.SomeToken.transfer(this.state.tokenToAddress,this.state.sendToken).encodeABI()
    console.log("DATA:",data)
    console.log("SENDING ",this.state.sendToken," tokens at address "+this.state.sendTokenAddress+" to address "+this.state.tokenToAddress)
    this.setState({sendToken:"",sendTokenAddress:"",tokenToAddress:""})
    this.sendMetaTx(contract._address,account,this.state.sendTokenAddress,0,data)
  }
  async sendMetaTx(proxyAddress,fromAddress,toAddress,value,txData){
    let {contract,account,web3} = this.props
    const nonce = await contract.nonce(fromAddress).call()
    console.log("Current nonce for "+fromAddress+" is ",nonce)
    let rewardAddress = "0x0000000000000000000000000000000000000000"
    let rewardAmount = 0
    if(this.state.rewardTokenAddress){
      if(this.state.rewardTokenAddress=="1"||this.state.rewardTokenAddress=="0x0000000000000000000000000000000000000001"){
        rewardAddress = "0x0000000000000000000000000000000000000001"
        this.setState({rewardTokenAddress:rewardAddress})
        rewardAmount = web3.utils.toWei(this.state.rewardToken+"", 'ether')
        console.log("rewardAmount",rewardAmount)
      }else{
        rewardAddress = this.state.rewardTokenAddress
        rewardAmount = this.state.rewardToken
      }
    }

    console.log("Reward: "+rewardAmount+" tokens at address "+rewardAddress)
    const parts = [
      proxyAddress,
      fromAddress,
      toAddress,
      web3.utils.toTwosComplement(value),
      txData,
      rewardAddress,
      /*web3.utils.toTwosComplement(rewardAmount),*/
      web3.utils.toTwosComplement(rewardAmount),
      web3.utils.toTwosComplement(nonce),
    ]
    /*web3.utils.padLeft("0x"+nonce,64),*/
    console.log("PARTS",parts)
    const hashOfMessage = soliditySha3(...parts);
    const message = hashOfMessage
    console.log("sign",message)
    let sig = await this.props.web3.eth.personal.sign(""+message,account)
    console.log("SIG",sig)
    let postData = {
      gas: this.state.gasLimit,
      message: message,
      parts:parts,
      sig:sig,
    }
    axios.post(this.props.backendUrl+'tx', postData, {
      headers: {
          'Content-Type': 'application/json',
      }
    }).then((response)=>{
      console.log("TX RESULT",response)
    })
    .catch((error)=>{
      console.log(error);
    });
  }
  render() {
    return (
      <div style={{marginTop:20}}>
        <h3>Example Contract:</h3>
        Count: {this.state.count}
        <div className="button" onClick={this.addAmountMeta.bind(this)}>
          meta addAmount(5)
        </div>
        <div>
          Send
          <input
              style={{verticalAlign:"middle",width:50,margin:6,maxHeight:20,padding:5,border:'2px solid #ccc',borderRadius:5}}
              type="text" name="sendEther" value={this.state.sendEther} onChange={this.handleInput.bind(this)}
          /> ether to <input
              style={{verticalAlign:"middle",width:300,margin:6,maxHeight:20,padding:5,border:'2px solid #ccc',borderRadius:5}}
              type="text" name="toAddress" value={this.state.toAddress} onChange={this.handleInput.bind(this)}
          />
          <div className="button" onClick={this.sendEther.bind(this)}>
           Send
          </div>
        </div>
        <div>
          Send
          <input
              style={{verticalAlign:"middle",width:50,margin:6,maxHeight:20,padding:5,border:'2px solid #ccc',borderRadius:5}}
              type="text" name="sendToken" value={this.state.sendToken} onChange={this.handleInput.bind(this)}
          /> of token <input
              style={{verticalAlign:"middle",width:300,margin:6,maxHeight:20,padding:5,border:'2px solid #ccc',borderRadius:5}}
              type="text" name="sendTokenAddress" value={this.state.sendTokenAddress} onChange={this.handleInput.bind(this)}
          />  to address <input
              style={{verticalAlign:"middle",width:300,margin:6,maxHeight:20,padding:5,border:'2px solid #ccc',borderRadius:5}}
              type="text" name="tokenToAddress" value={this.state.tokenToAddress} onChange={this.handleInput.bind(this)}
          />
          <div className="button" onClick={this.sendToken.bind(this)}>
           Send Token
          </div>

          <div style={{borderTop:"1px solid #DDDDDD",marginTop:25,paddingTop:15}}>
          Gas Limit: <input
              style={{verticalAlign:"middle",width:300,margin:6,maxHeight:20,padding:5,border:'2px solid #ccc',borderRadius:5}}
              type="text" name="gasLimit" value={this.state.gasLimit} onChange={this.handleInput.bind(this)}
          />
          </div>
          <div>
          Reward:
          <input
              style={{verticalAlign:"middle",width:200,margin:6,maxHeight:20,padding:5,border:'2px solid #ccc',borderRadius:5}}
              type="text" name="rewardToken" value={this.state.rewardToken} onChange={this.handleInput.bind(this)}
          /> of token <input
              style={{verticalAlign:"middle",width:300,margin:6,maxHeight:20,padding:5,border:'2px solid #ccc',borderRadius:5}}
              type="text" name="rewardTokenAddress" value={this.state.rewardTokenAddress} onChange={this.handleInput.bind(this)}
          />
          </div>

        </div>
      </div>
    );
  }
}

export default Bouncer;

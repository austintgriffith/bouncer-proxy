import React, { Component } from 'react';
import { Blockie, Scaler, Button } from "dapparatus"
import axios from 'axios';

let pollInterval
let pollTime = 1501

class Backend extends Component {
  constructor(props) {
    super(props);
    this.state = {
      sigs: []
    }
  }
  componentDidMount(){
  //  pollInterval = setInterval(this.load.bind(this),pollTime)
  //  this.load()
  //


    this.props.ipfsSigs.on('message', async (message) => {

      let data = JSON.parse(message.data)
      console.log(data)
      this.state.sigs.push(data)
      this.setState({sigs:this.state.sigs},()=>{
        console.log("SIGS",this.state.sigs)
      })
    })

  }
  componentWillUnmount(){
  //  clearInterval(pollInterval)
  }
  /*load(){
    axios.get(this.props.backendUrl+"sigs/"+this.props.address)
    .then((response)=>{
      //console.log(response)
      this.setState({sigs:response.data})
    })
    .catch((error)=>{
      console.log(error);
    });
  }*/
  async signContract() {
    let timestamp = Date.now()
    let message = ""+this.props.account+" trusts bouncer proxy "+this.props.address+" at "+timestamp
    console.log("sign",message)
    let sig = await this.props.web3.eth.personal.sign(message, this.props.account)
    console.log("SIG",sig)
    let data = JSON.stringify({
      address:this.props.address,
      account:this.props.account,
      timestamp:timestamp,
      message:message,
      sig:sig
    })
    console.log("BROADCASTING",data)
    this.props.ipfsSigs.broadcast(data)
  }
  render() {

    let sigs = []
    //console.log("this.state.sigs",this.state.sigs)
    if(this.state.sigs){
      for(let s in this.state.sigs){
        let sig = this.state.sigs[s].account
        sigs.push(
          <span key={"sig"+sig} style={{padding:3,cursor:"pointer"}} onClick={()=>{
            console.log("updateBouncer",sig)
            this.props.updateBouncer(sig)
          }}>
            <Blockie address={sig} config={{size:5}} />
          </span>
        )
      }
    }

    return (
      <div style={{position:"fixed",bottom:20,left:20}}>
        <Scaler config={{startZoomAt:900,origin:"0px 100px",adjustedZoom:1.2}}>
          <div style={{paddingLeft:20}}>
            {sigs}
          </div>
          <Button size="2" onClick={this.signContract.bind(this)}>
            Sign
          </Button>
        </Scaler>
      </div>
    );
  }
}

export default Backend;

import React, { Component } from 'react';
import { Address, Scaler } from "dapparatus"
import { soliditySha3 } from 'web3-utils';
import axios from 'axios';

let pollInterval
let pollTime = 509

class Bouncer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      address:false,
    }
  }
  componentDidMount(){
    pollInterval = setInterval(this.load.bind(this),pollTime)
    this.load()
  }
  componentWillUnmount(){
    clearInterval(pollInterval)
  }
  async load(){
    axios.get(this.props.backendUrl+"miner")
    .then((response)=>{
      //console.log(response)
      this.setState({address:response.data.address})
    })
    .catch((error)=>{
      console.log(error);
    });
  }
  render() {

    let address = "Loading..."
    if(this.state.address){
      address = (
        <Address
          {...this.props}
          address={this.state.address}
        />
      )
    }
    return (
      <div style={{marginTop:20,position:"fixed",bottom:10,right:50}}>
        <Scaler config={{startZoomAt:1000,origin:"1000px 60px"}}>
          {address}
        </Scaler>
      </div>
    );
  }
}

export default Bouncer;

import React, { Component } from 'react';
import { Metamask, Gas, ContractLoader, Transactions, Events, Scaler, Blockie } from "dapparatus"

import axios from 'axios';


let pollInterval
let pollTime = 509



class Bouncer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      count: "loading..."
    }
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
  addAmount(){
    let {tx,contracts} = this.props
    tx(contracts.Example.addAmount(5))
  }
  addAmountMeta(){
    axios.get('http://localhost:10001')
      .then((response)=>{
        console.log(response)
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

        <div className="button" onClick={this.addAmount.bind(this)}>
          addAmount(5)
        </div>

        <div className="button" onClick={this.addAmountMeta.bind(this)}>
          meta addAmount(5)
        </div>

      </div>
    );
  }
}

export default Bouncer;

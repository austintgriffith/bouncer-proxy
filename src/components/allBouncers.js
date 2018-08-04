import React, { Component } from 'react';
import { Scaler, Blockie } from "dapparatus"
import axios from 'axios';
import StackGrid from "react-stack-grid";

let pollInterval
let pollTime = 1501

class allBouncers extends Component {
  constructor(props) {
    super(props);
    this.state = {
      contracts: []
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
    let {contracts} = this.props
    axios.get(this.props.backendUrl+"contracts")
    .then((response)=>{
      //console.log("CONTRACTS DEPLOYED:",response)
      this.setState({contracts:response.data})
    })
    .catch((error)=>{
      console.log(error);
    });
  }
  render() {

    if(!this.state.contracts){
      return (<div></div>)
    }

    let contractDisplay = this.state.contracts.map((contract)=>{
      if(contract){
        return (
          <div key={contract} ><a href={"/"+contract}><Blockie address={contract.toLowerCase()} config={{size:6}}/></a></div>
        )
      }
    })


    return (
      <StackGrid columnWidth={60}>
        {contractDisplay}
      </StackGrid>
    );
  }
}

export default allBouncers;

import React, { Component } from 'react';
import { Metamask, Gas, ContractLoader, Transactions, Events, Scaler, Blockie, Button } from "dapparatus"

class Owner extends Component {
  constructor(props) {
    super(props);
    this.state = {
      addBouncer:"",
      removeBouncer:"",
      bouncers:[],
      removebouncers:[]
    }
  }
  handleBouncer(e){
    this.props.updateBouncer(e.target.value)
  }
  addBouncer(){
    let {tx,contract} = this.props
    console.log("Add Bouncer ",this.props.bouncer)
    tx(contract.addBouncer(this.props.bouncer),55000,(receipt)=>{
      console.log("~~~~ BOUNCER ADDED:",receipt)
    })
  }
  removeBouncer(){
    let {tx,contract} = this.props
    console.log("Remove Bouncer ",this.props.bouncer)
    tx(contract.removeBouncer(this.props.bouncer),55000)
  }
  render() {

    let bouncers = ""
    if(this.state.bouncers){
      bouncers=this.state.bouncers.map((bouncer)=>{
        return (
          <div>
            <Blockie address={bouncer} /> {bouncer}
          </div>
        )
      })
    }

    let bouncerBlockie
    if(this.props.bouncer && this.props.bouncer.length){
      bouncerBlockie = this.props.bouncer.toLowerCase()
    }
    console.log("bouncerBlockie",bouncerBlockie)
    if(!bouncerBlockie || bouncerBlockie.length<=0){
      bouncerBlockie = "0x0000000000000000000000000000000000000000"
    }
    console.log("bouncerBlockie2",bouncerBlockie)
    return (
      <div>
        <Scaler config={{startZoomAt:1000}}>
        <div style={{width:800,borderBottom:"1px solid #BBBBBB",marginBottom:25,paddingBottom:15}}></div>
        <input
          style={{verticalAlign:"middle",width:300,margin:6,maxHeight:20,padding:5,border:'2px solid #ccc',borderRadius:5}}
          type="text" name="addBouncer" value={this.props.bouncer} onChange={this.handleBouncer.bind(this)}
        />
        <Blockie
          address={bouncerBlockie}
        />
        <Button color="blue" onClick={this.addBouncer.bind(this)}>
          Add Bouncer
        </Button>
        <Button color="orange" onClick={this.removeBouncer.bind(this)}>
          Remove Bouncer
        </Button>
        <div>
          {bouncers}
        </div>
        <Events
        config={{hide:false,DEBUG:true}}
          contract={this.props.contract}
          eventName={"RoleAdded"}
          block={this.props.block}
          onUpdate={(eventData,allEvents)=>{
            console.log("RoleAdded",eventData)
            this.state.bouncers.push(eventData.operator.toLowerCase())
            let update = {bouncers:this.state.bouncers}
            this.setState(update)
            this.props.onUpdate(update)
          }}
        />
        <Events
        config={{hide:false,DEBUG:true}}
          contract={this.props.contract}
          eventName={"RoleRemoved"}
          block={this.props.block}
          onUpdate={(eventData,allEvents)=>{
            console.log("RoleRemoved",eventData)
            let newBouncers = []
            for(let b in this.state.bouncers){
              if(this.state.bouncers[b]!=eventData.operator.toLowerCase()){
                newBouncers.push(this.state.bouncers[b])
              }
            }
            let update = {bouncers:newBouncers}
            this.setState(update)
            this.props.onUpdate(update)
          }}
        />
        <div style={{width:800,borderBottom:"1px solid #BBBBBB",marginBottom:25,paddingBottom:15}}></div>
        <Events
        config={{hide:false}}
          contract={this.props.contract}
          eventName={"Forwarded"}
          block={this.props.block}
          onUpdate={(eventData,allEvents)=>{
            console.log("Forwarded",eventData)
            //this.setState({roleAddedEvents:allEvents.reverse()})
          }}
        />
        </Scaler>
      </div>
    );
  }
}

export default Owner;

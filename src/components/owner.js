import React, { Component } from 'react';
import { Metamask, Gas, ContractLoader, Transactions, Events, Scaler, Blockie } from "dapparatus"

class Owner extends Component {
  constructor(props) {
    super(props);
    this.state = {
      addBouncer:"",
      bouncers:[]
    }
  }
  handleInput(e){
    let update = {}
    update[e.target.name] = e.target.value
    this.setState(update)
  }
  addBouncer(){
    let {tx,contract} = this.props
    console.log("Add Bouncer ",this.state.addBouncer)
    tx(contract.addBouncer(this.state.addBouncer),55000)

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

    return (
      <div>
        Add Bouncer:
        <input
          style={{verticalAlign:"middle",width:300,margin:6,maxHeight:20,padding:5,border:'2px solid #ccc',borderRadius:5}}
          type="text" name="addBouncer" value={this.state.addBouncer} onChange={this.handleInput.bind(this)}
        />
        <Blockie
          address={this.state.addBouncer.toLowerCase()}
        />
        <span className={"button"} style={{padding:3}} onClick={this.addBouncer.bind(this)}>
          Save
        </span>

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
        config={{hide:false}}
          contract={this.props.contract}
          eventName={"Forwarded"}
          block={this.props.block}
          onUpdate={(eventData,allEvents)=>{
            console.log("Forwarded",eventData)
            //this.setState({roleAddedEvents:allEvents.reverse()})
          }}
        />

      </div>
    );
  }
}

export default Owner;

const LOOKBACK = 16;
module.exports = async function(contract,eventName,currentBlock,updateFn,filter){
  let from = parseInt(currentBlock)-LOOKBACK
  let to = 'latest'
  let events
  if(filter){
    events = await contract.getPastEvents(eventName, {
      filter: filter,
      fromBlock: from,
      toBlock: to
    });
  }else{
    events = await contract.getPastEvents(eventName, {
      fromBlock: from,
      toBlock: to
    });
  }
  for(let e in events){
    let thisEvent = events[e].returnValues;
    thisEvent.blockNumber = events[e].blockNumber
    updateFn(thisEvent);
  }
  return true;
}

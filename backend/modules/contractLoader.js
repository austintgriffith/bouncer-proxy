module.exports = function(contractList,web3){
  let contracts = []
  for(let c in contractList){
    try{
      let abi = require("../../src/contracts/"+contractList[c]+".abi.js")
      let address = require("../../src/contracts/"+contractList[c]+".address.js")
      console.log(contractList[c],address,abi.length)
      contracts[contractList[c]] = new web3.eth.Contract(abi,address)
      console.log("contract")
      contracts[contractList[c]].blockNumber = require("../../src/contracts/"+contractList[c]+".blocknumber.js")
      console.log("@ Block",contracts[contractList[c]].blockNumber)
    }catch(e){console.log(e)}
  }
  return contracts
}

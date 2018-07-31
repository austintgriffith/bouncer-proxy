const clevis = require("clevis")
const colors = require('colors')
const chai = require("chai")
const assert = chai.assert
const expect = chai.expect;
const should = chai.should();
const fs = require('fs')
const Web3 = require('web3')
const clevisConfig = JSON.parse(fs.readFileSync("clevis.json").toString().trim())
web3 = new Web3(new Web3.providers.HttpProvider(clevisConfig.provider))
function localContractAddress(contract){
  return fs.readFileSync(contract+"/"+contract+".address").toString().trim()
}
function localContractAbi(contract){
  return JSON.parse(fs.readFileSync(contract+"/"+contract+".abi").toString().trim())
}
function printTxResult(result){
  if(!result||!result.transactionHash){
    console.log("ERROR".red,"MISSING TX HASH".yellow)
  }else{
    console.log(tab,result.transactionHash.gray,(""+result.gasUsed).yellow)
  }
}
function bigHeader(str){
  return "########### "+str+" "+Array(128-str.length).join("#")
}
function rand(min, max) {
  return Math.floor( Math.random() * (max - min) + min );
}
function getPaddedHexFromNumber(num,digits){
  let hexIs = web3.utils.numberToHex(num).replace("0x","");
  while(hexIs.length<digits){
    hexIs = "0"+hexIs
  }
  return hexIs
}
const tab = "\t\t";
module.exports = {


  web3:web3,
  localContractAddress,localContractAddress,
  contracts:fs.readFileSync("contracts.clevis").toString().trim().split("\n"),
  reload:()=>{
    describe('#reload() ', function() {
      it('should force browser to reload', async function() {
        fs.writeFileSync("public/reload.txt",Date.now());
      });
    });
  },
  version:()=>{
    describe('#version() ', function() {
      it('should get version', async function() {
        this.timeout(90000)
        const result = await clevis("version")
        console.log(result)
      });
    });
  },
  blockNumber:()=>{
    describe('#blockNumber() ', function() {
      it('should get blockNumber', async function() {
        this.timeout(90000)
        const result = await clevis("blockNumber")
        console.log(result)
      });
    });
  },
  compile:(contract)=>{
    describe('#compile() '+contract.magenta, function() {
      it('should compile '+contract.magenta+' contract to bytecode', async function() {
        this.timeout(90000)
        const result = await clevis("compile",contract)
        console.log(result)
        assert(Object.keys(result.contracts).length>0, "No compiled contacts found.")
        let count = 0
        for(let c in result.contracts){
          console.log("\t\t"+"contract "+c.blue+": ",result.contracts[c].bytecode.length)
          if(count++==0){
              assert(result.contracts[c].bytecode.length > 1, "No bytecode for contract "+c)
          }
        }
      });
    });
  },
  deploy:(contract,accountindex)=>{
    describe('#deploy() '+contract.magenta, function() {
      it('should deploy '+contract.magenta+' as account '+accountindex, async function() {
        this.timeout(360000)
        const result = await clevis("deploy",contract,accountindex)
        printTxResult(result)
        console.log(tab+"Address: "+result.contractAddress.blue)
        assert(result.contractAddress)
      });
    });
  },

  publish:()=>{
    describe('#publish() ', function() {
      it('should inject contract address and abi into web app', async function() {
        this.timeout(120000)
        const fs = require("fs")
        if(!fs.existsSync("src")){
          fs.mkdirSync("src");
        }
        if(!fs.existsSync("src/contracts")){
          fs.mkdirSync("src/contracts");
        }
        for(let c in module.exports.contracts){
          let thisContract = module.exports.contracts[c]
          console.log(tab,thisContract.magenta)
          let address = fs.readFileSync(thisContract+"/"+thisContract+".address").toString().trim()
          console.log(tab,"ADDRESS:",address.blue)
          assert(address,"No Address!?")
          fs.writeFileSync("src/contracts/"+thisContract+".address.js","module.exports = \""+address+"\"");
          let blockNumber = fs.readFileSync(thisContract+"/"+thisContract+".blockNumber").toString().trim()
          console.log(tab,"blockNumber:",blockNumber.blue)
          assert(blockNumber,"No blockNumber!?")
          fs.writeFileSync("src/contracts/"+thisContract+".blocknumber.js","module.exports = \""+blockNumber+"\"");
          let abi = fs.readFileSync(thisContract+"/"+thisContract+".abi").toString().trim()
          fs.writeFileSync("src/contracts/"+thisContract+".abi.js","module.exports = "+abi);
          let bytecode = fs.readFileSync(thisContract+"/"+thisContract+".bytecode").toString().trim()
          fs.writeFileSync("src/contracts/"+thisContract+".bytecode.js","module.exports = \""+bytecode+"\"");
        }
        fs.writeFileSync("src/contracts/contracts.js","module.exports = "+JSON.stringify(module.exports.contracts));
        module.exports.reload()
      });
    });
  },
  metamask:()=>{
    describe('#transfer() ', function() {
      it('should give metamask account some ether or tokens to test', async function() {
        this.timeout(600000)
        let result = await clevis("sendTo","0.1","0","0x2a906694D15Df38F59e76ED3a5735f8AAbccE9cb")
        printTxResult(result)
        result = await clevis("sendTo","0.1","0","0x5f19cefc9c9d1bc63f9e4d4780493ff5577d238b")
        printTxResult(result)

        //here is an example of running a funtion from within this object:
        //module.exports.mintTo("Greens",0,"0x2a906694d15df38f59e76ed3a5735f8aabcce9cb",20)
        //view more examples here: https://github.com/austintgriffith/galleass/blob/master/tests/galleass.js
      });
    });
  },

  ////----------------------------------------------------------------------------///////////////////


  addBouncer:(accountIndex,bouncerAccountIndex)=>{
    describe('#addBouncer', function() {
      it('should add account with index bouncerAccountIndex as a bouncer', async function() {
        this.timeout(600000)

        const accounts = await clevis("accounts")

        const result = await clevis("contract","addBouncer","BouncerProxy",accountIndex,accounts[bouncerAccountIndex])
        printTxResult(result)
      });
    });
  },
  fwd:(accountIndexSender,accountIndexSigner)=>{
    describe('#fwd', function() {
      it('should build meta transaction into data, sign it as accountIndexSigner and send it as accountIndexSender ', async function() {
        this.timeout(600000)

        const accounts = await clevis("accounts")

        let testAbi = localContractAbi("Example")
        let testAddress = localContractAddress("Example")
        var data = (new web3.eth.Contract(testAbi,testAddress)).methods.addAmount(5).encodeABI()
        console.log("DATA:",data)
        //const result = await clevis("contract","forward","TEst",accountIndex,localContractAddress("Example"),"0",data)
        //printTxResult(result)

        const nonce = await clevis("contract","nonce","BouncerProxy",accounts[accountIndexSigner])

        console.log("Current nonce for "+accounts[accountIndexSigner]+" is ",nonce)

        const { soliditySha3 } = require('web3-utils');

        const rewardAddress = "0x0000000000000000000000000000000000000000"

        const reqardAmount = 0

        //keccak256(abi.encodePacked(address(this), signer, destination, value, data, nonce[signer])),
        const parts = [
          localContractAddress("BouncerProxy"),
          accounts[accountIndexSigner],
          localContractAddress("Example"),
          web3.utils.toTwosComplement(0),
          data,
          rewardAddress,
          web3.utils.toTwosComplement(reqardAmount),
          web3.utils.toTwosComplement(nonce),
        ]
        console.log("PARTS",parts)
        const hashOfMessage = soliditySha3(...parts);

        const message = hashOfMessage

        let sig = await web3.eth.sign(message, accounts[accountIndexSigner])

        console.log("message:"+message+" sig:",sig)

        //function forward(bytes sig, address signer, address destination, uint value, bytes data) public {
        const result = await clevis("contract","forward","BouncerProxy",accountIndexSender,sig,accounts[accountIndexSigner],localContractAddress("Example"),"0",data,rewardAddress,reqardAmount)
        printTxResult(result)
      });
    });
  },
  fwdAndPaySomeToken:(accountIndexSender,accountIndexSigner)=>{
    describe('#fwdAndPaySomeToken', function() {
      it('should build meta transaction into data, sign it as accountIndexSigner and send it as accountIndexSender ', async function() {
        this.timeout(600000)

        const accounts = await clevis("accounts")

        let testAbi = localContractAbi("Example")
        let testAddress = localContractAddress("Example")
        var data = (new web3.eth.Contract(testAbi,testAddress)).methods.addAmount(5).encodeABI()
        console.log("DATA:",data)

        const nonce = await clevis("contract","nonce","BouncerProxy",accounts[accountIndexSigner])

        console.log("Current nonce for "+accounts[accountIndexSigner]+" is ",nonce)

        const { soliditySha3 } = require('web3-utils');

        const rewardAddress = localContractAddress("SomeToken")

        const rewardAmount = 9

        //keccak256(abi.encodePacked(address(this), signer, destination, value, data, nonce[signer])),
        const parts = [
          localContractAddress("BouncerProxy"),
          accounts[accountIndexSigner],
          localContractAddress("Example"),
          web3.utils.toTwosComplement(0),
          data,
          rewardAddress,
          web3.utils.toTwosComplement(rewardAmount),
          web3.utils.toTwosComplement(nonce),
        ]
        console.log("PARTS",parts)
        const hashOfMessage = soliditySha3(...parts);

        const message = hashOfMessage

        let sig = await web3.eth.sign(message, accounts[accountIndexSigner])

        console.log("message:"+message+" sig:",sig)

        //function forward(bytes sig, address signer, address destination, uint value, bytes data) public {
        const result = await clevis("contract","forward","BouncerProxy",accountIndexSender,sig,accounts[accountIndexSigner],localContractAddress("Example"),"0",data,rewardAddress,rewardAmount)
        printTxResult(result)
      });
    });
  },


  mintSomeToken:(accountIndex,toAccountIndex,amount)=>{
    describe('#mintSomeToken', function() {
      it('should mint SomeToken to toAccountIndex', async function() {
        this.timeout(600000)

        const accounts = await clevis("accounts")
        const result = await clevis("contract","Mint","SomeToken",accountIndex,accounts[toAccountIndex],amount)
        printTxResult(result)
      });
    });
  },
  approveBouncerProxy:(accountIndex,amount)=>{
    describe('#approveBouncerProxy', function() {
      it('should approve BouncerProxy to transfer SomeToken', async function() {
        this.timeout(600000)
        const result = await clevis("contract","approve","SomeToken",accountIndex,localContractAddress("BouncerProxy"),amount)
        printTxResult(result)
      });
    });
  },

  ////----------------------------------------------------------------------------///////////////////


  full:()=>{
    describe(bigHeader('COMPILE'), function() {
      it('should compile all contracts', async function() {
        this.timeout(6000000)
        const result = await clevis("test","compile")
        assert(result==0,"deploy ERRORS")
      });
    });
    describe(bigHeader('FAST'), function() {
      it('should run the fast test (everything after compile)', async function() {
        this.timeout(6000000)
        const result = await clevis("test","fast")
        assert(result==0,"fast ERRORS")
      });
    });
  },

  fast:()=>{
    describe(bigHeader('DEPLOY'), function() {
      it('should deploy all contracts', async function() {
        this.timeout(6000000)
        const result = await clevis("test","deploy")
        assert(result==0,"deploy ERRORS")
      });
    });
    describe(bigHeader('METAMASK'), function() {
      it('should deploy all contracts', async function() {
        this.timeout(6000000)
        const result = await clevis("test","metamask")
        assert(result==0,"metamask ERRORS")
      });
    });
    describe(bigHeader('PUBLISH'), function() {
      it('should publish all contracts', async function() {
        this.timeout(6000000)
        const result = await clevis("test","publish")
        assert(result==0,"publish ERRORS")
      });
    });

  },

}

checkContractDeployment = async (contract)=>{
  const localAddress = localContractAddress(contract)
  const address = await clevis("contract","getContract","Example",web3.utils.fromAscii(contract))
  console.log(tab,contract.blue+" contract address is "+(localAddress+"").magenta+" deployed as: "+(address+"").magenta)
  assert(localAddress==address,contract.red+" isn't deployed correctly!?")
  return address
}

/*
makeSureContractHasTokens = async (contract,contractAddress,token)=>{
  const TokenBalance = await clevis("contract","balanceOf",token,contractAddress)
  console.log(tab,contract.magenta+" has "+TokenBalance+" "+token)
  assert(TokenBalance>0,contract.red+" doesn't have any "+token.red)
}

view more examples here: https://github.com/austintgriffith/galleass/blob/master/tests/galleass.js

*/

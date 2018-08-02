/*

  run from parent directory:

  mocha tests/account.js

*/
const clevis = require("clevis")
const colors = require('colors')
const chai = require("chai")
const assert = chai.assert
const expect = chai.expect;
const should = chai.should();


//--------------------------------------------------------//

testAccounts()
//testContractCompile("Contract")
//testContractDeploy("Contract",0)

//--------------------------------------------------------//

function testAccounts(){
  describe('#accounts()', function() {
    it('should have at least one accounts to work with', async function() {
      const accounts = await clevis("accounts")
      console.log(accounts)
      assert(accounts.length > 0)
    });
  });
}

function testContractCompile(contract){
  const tab = "\t\t";
  describe('#compile() '+contract.magenta, function() {
    it('should compile '+contract.magenta+' contract to bytecode', async function() {
      this.timeout(10000)
      const result = await clevis("compile",contract)
      for(let c in result.contracts){
        console.log("\t\t"+"contract "+c.blue+": ",result.contracts[c].bytecode.length)
        assert(result.contracts[c].bytecode.length > 1)
      }
    });
  });
}

function testContractDeploy(contract,accountindex){
  const tab = "\t\t";
  describe('#deploy() '+contract.magenta, function() {
    it('should deploy '+contract.magenta+' as account '+accountindex, async function() {
      this.timeout(60000)
      const result = await clevis("deploy",contract,accountindex)
      console.log(tab+"Address: "+result.contractAddress.blue)
      assert(result.contractAddress)
    });
  });
}

// -------------------- example contract logic tests ---------------------------------------- //

function accountCanSetName(contract,account,name){
  const tab = "\t\t";
  describe('#testCanSetName() '+contract.magenta, function() {
    it('should set the name of '+contract.magenta+' as account '+account, async function() {
      this.timeout(10000)

      let setResult = await clevis("contract","setName",contract,account,name)
      //console.log(setResult)
      assert(setResult.status == 1)
      console.log(tab+"Status: "+setResult.status.toString().blue)

      let gotName = await clevis("contract","name",contract)
      assert(gotName == name)
      console.log(tab+"Name: "+gotName.blue)

    });
  });
}

function accountCanNOTSetName(contract,account,name){
  const tab = "\t\t";
  describe('#testCanNOTSetName() '+contract.magenta, function() {
    it('should fail to set the name of '+contract.magenta+' as account '+account+" with a 'revert' error", async function() {
      this.timeout(10000)
      //let revertError = new Error("Error: Returned error: VM Exception while processing transaction: revert")
      //expect( await clevis("contract","setName",contract,account,name) ).to.be.rejectedWith('revert');
      let error
      try{
        await clevis("contract","setName",contract,account,name)
        console.log(tab,"WARNING".red,"WAS ABLE TO SET!".yellow)
      }catch(e){
        error = e.toString()
      }
      assert(error.indexOf("VM Exception while processing transaction: revert")>0)
    });
  });
}

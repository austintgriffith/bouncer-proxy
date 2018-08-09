pragma solidity ^0.4.24;

/*
  Bouncer identity proxy that executes meta transactions for etherless accounts.

  Purpose:
  I wanted a way for etherless accounts to transact with the blockchain through an identity proxy without paying gas.
  I'm sure there are many examples of something like this already deployed that work a lot better, this is just me learning.
    (I would love feedback: https://twitter.com/austingriffith)

  1) An etherless account crafts a meta transaction and signs it
  2) A (properly incentivized) relay account submits the transaction to the BouncerProxy and pays the gas
  3) If the meta transaction is valid AND the etherless account is a valid 'Bouncer', the transaction is executed
      (and the sender is paid in arbitrary tokens from the signer)

  Inspired by:
    @avsa - https://www.youtube.com/watch?v=qF2lhJzngto found this later: https://github.com/status-im/contracts/blob/73-economic-abstraction/contracts/identity/IdentityGasRelay.sol
    @mattgcondon - https://twitter.com/mattgcondon/status/1022287545139449856 && https://twitter.com/mattgcondon/status/1021984009428107264
    @owocki - https://twitter.com/owocki/status/1021859962882908160
    @danfinlay - https://twitter.com/danfinlay/status/1022271384938983424
    @PhABCD - https://twitter.com/PhABCD/status/1021974772786319361
    gnosis-safe
    uport-identity

*/

//new use case: something very similar to the eth alarm clock dudes
// gitcoin wants to run a subscription like service and have all the trasacions
// run as meta trasactions so accounts don't have to worry about getting on at
// a certain time to push a tx through every month, week, day, hour, etc
// we'll use a minBlock requirement and have a nonce for each minBlock so
// other transactions can still come through normally with minBlock=0 but
// you also want to avoid replay attacks for specific minBlocks


//use case 1:
//you deploy the bouncer proxy and use it as a standard identity for your own etherless accounts
//  (multiple devices you don't want to store eth on or move private keys to will need to be added as Bouncers)
//you run your own relayer and the rewardToken is 0

//use case 2:
//you deploy the bouncer proxy and use it as a standard identity for your own etherless accounts
//  (multiple devices you don't want to store eth on or move private keys to will need to be added as Bouncers)
//  a community if relayers are incentivized by the rewardToken to pay the gas to run your transactions for you
//SEE: universal logins via @avsa

//use case 3:
//you deploy the bouncer proxy and use it to let third parties submit transactions as a standard identity
//  (multiple developer accounts will need to be added as Bouncers to 'whitelist' them to make meta transactions)
//you run your own relayer and pay for all of their transactions, revoking any bad actors if needed
//SEE: GitCoin (via @owocki) wants to pay for some of the initial transactions of their Developers to lower the barrier to entry

//use case 4:
//you deploy the bouncer proxy and use it to let third parties submit transactions as a standard identity
//  (multiple developer accounts will need to be added as Bouncers to 'whitelist' them to make meta transactions)
//you run your own relayer and pay for all of their transactions, revoking any bad actors if needed

import "openzeppelin-solidity/contracts/access/SignatureBouncer.sol";
contract BouncerProxy is SignatureBouncer {
  constructor() public { }
  //to avoid replay but separate for different minBlocks
  mapping(address => mapping(uint => uint)) public nonce;
  // copied from https://github.com/uport-project/uport-identity/blob/develop/contracts/Proxy.sol
  function () payable { emit Received(msg.sender, msg.value); }
  event Received (address indexed sender, uint value);
  // original forward function copied from https://github.com/uport-project/uport-identity/blob/develop/contracts/Proxy.sol
  function forward(bytes sig, address signer, address destination, uint value, bytes data, address rewardToken, uint rewardAmount,uint minBlock) public {
      //sig and block must be valid
      require(isValidSigAndBlock(sig,signer,destination,value,data,rewardToken,rewardAmount,minBlock));
      //increment nonce for so noone and replay this transaction
      nonce[signer][minBlock]++;
      //make sure the signer pays in whatever token (or ether) the sender and signer agreed to
      // or skip this if the sender is incentivized in other ways and there is no need for a token
      //to meet @avsa's example, 0 means ether and 0 rewardAmount means free metatx
      if(rewardToken==address(0)){
        if(rewardAmount>0){
          //REWARD ETHER
          require(msg.sender.call.value(rewardAmount).gas(36000)());
        }
      }else{
        //REWARD TOKEN
        require((StandardToken(rewardToken)).transfer(msg.sender,rewardAmount));
      }
      //execute the transaction with all the given parameters
      require(executeCall(destination, value, data));
      emit Forwarded(sig, signer, destination, value, data, rewardToken, rewardAmount, minBlock);
  }
  // when some frontends see that a tx is made from a bouncerproxy, they may want to parse through these events to find out who the signer was etc
  event Forwarded (bytes sig, address signer, address destination, uint value, bytes data,address rewardToken, uint rewardAmount, uint minBlock);

  function isValidSigAndBlock(bytes sig, address signer, address destination, uint value, bytes data, address rewardToken, uint rewardAmount,uint minBlock) public view returns (bool) {
    //if they specify a minimum block, make sure the current block is on or after the requirement
    //eventually typedef the minblock to a uint64... no need to be 256bits
    //this min block could have a second use... uPort reported nonces getting weird when a bunch of transactions fire at once
    // well if you are about to do ten transactions, you could use the minblock as almost like a namespace
    // use the minBlock=1 nonce for one transactions and minBlock=2 for another... then they could be run
    // in either order but only once  eh? eh? maybe... idk...
    if(block.number<minBlock){
        return false;
    }
    //there is a nonce for each minBlock so normal transactions can run on minblock==0
    uint _nonce = nonce[signer][minBlock];
    //the hash contains all of the information about the meta transaction to be called
    bytes32 _hash = keccak256(abi.encodePacked(address(this), signer, destination, value, data, rewardToken, rewardAmount, minBlock, _nonce));
    //this makes sure signer signed correctly AND signer is a valid bouncer
    return isValidDataHash(_hash,sig);
  }

  // copied from https://github.com/uport-project/uport-identity/blob/develop/contracts/Proxy.sol
  // which was copied from GnosisSafe
  // https://github.com/gnosis/gnosis-safe-contracts/blob/master/contracts/GnosisSafe.sol
  function executeCall(address to, uint256 value, bytes data) internal returns (bool success) {
    assembly {
       success := call(gas, to, value, add(data, 0x20), mload(data), 0, 0)
    }
  }
}

contract StandardToken {
  function transfer(address _to,uint256 _value) public returns (bool) { }
}

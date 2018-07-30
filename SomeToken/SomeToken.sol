pragma solidity ^0.4.24;

/*

  This is just an example token to test out the incentives in a BouncerProxy

 */

import "openzeppelin-solidity/contracts/token/ERC20/MintableToken.sol";

contract SomeToken is MintableToken{

  string public name = "SomeToken";
  string public symbol = "ST";
  uint8 public decimals = 18;

  constructor() public { }

}

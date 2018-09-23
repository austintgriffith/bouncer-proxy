pragma solidity ^0.4.24;

/*

  This is just an example token to test out the incentives in a BouncerProxy

 */

import "openzeppelin-solidity/contracts/token/ERC20/ERC20Mintable.sol";


contract SomeToken is ERC20Mintable {

  string public name = "SomeToken";
  string public symbol = "ST";
  uint8 public decimals = 18;

  constructor() public { }

}

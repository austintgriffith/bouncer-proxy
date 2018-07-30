
const fs = require('fs');
module.exports = {
  'openzeppelin-solidity/contracts/math/SafeMath.sol': fs.readFileSync('openzeppelin-solidity/contracts/math/SafeMath.sol', 'utf8'),
  'openzeppelin-solidity/contracts/token/ERC20/ERC20Basic.sol': fs.readFileSync('openzeppelin-solidity/contracts/token/ERC20/ERC20Basic.sol', 'utf8'),
  'openzeppelin-solidity/contracts/token/ERC20/ERC20.sol': fs.readFileSync('openzeppelin-solidity/contracts/token/ERC20/ERC20.sol', 'utf8'),
  'openzeppelin-solidity/contracts/token/ERC20/BasicToken.sol': fs.readFileSync('openzeppelin-solidity/contracts/token/ERC20/BasicToken.sol', 'utf8'),
  'openzeppelin-solidity/contracts/ownership/Ownable.sol': fs.readFileSync('openzeppelin-solidity/contracts/ownership/Ownable.sol', 'utf8'),
  'openzeppelin-solidity/contracts/token/ERC20/StandardToken.sol': fs.readFileSync('openzeppelin-solidity/contracts/token/ERC20/StandardToken.sol', 'utf8'),
  'openzeppelin-solidity/contracts/token/ERC20/MintableToken.sol': fs.readFileSync('openzeppelin-solidity/contracts/token/ERC20/MintableToken.sol', 'utf8'),
}

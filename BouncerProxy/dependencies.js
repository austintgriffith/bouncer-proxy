
const fs = require('fs');
module.exports = {
  'openzeppelin-solidity/contracts/access/rbac/Roles.sol': fs.readFileSync('openzeppelin-solidity/contracts/access/rbac/Roles.sol', 'utf8'),
  'openzeppelin-solidity/contracts/ECRecovery.sol': fs.readFileSync('openzeppelin-solidity/contracts/ECRecovery.sol', 'utf8'),
  'openzeppelin-solidity/contracts/access/rbac/RBAC.sol': fs.readFileSync('openzeppelin-solidity/contracts/access/rbac/RBAC.sol', 'utf8'),
  'openzeppelin-solidity/contracts/ownership/Ownable.sol': fs.readFileSync('openzeppelin-solidity/contracts/ownership/Ownable.sol', 'utf8'),
  'openzeppelin-solidity/contracts/access/SignatureBouncer.sol': fs.readFileSync('openzeppelin-solidity/contracts/access/SignatureBouncer.sol', 'utf8'),
}

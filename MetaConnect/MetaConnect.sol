pragma solidity ^0.4.24;

contract MetaConnect {

  bytes32 public purpose = "ETHSF";

  constructor() public { }

  function getHash1(bytes32 handle1, uint256 timestamp) public view returns(bytes32){
    return keccak256(abi.encodePacked(address(this),handle1,timestamp));
  }

  function getHash2(bytes32 handle1, uint256 timestamp, bytes sig1, bytes32 handle2) public view returns(bytes32){
    return keccak256(abi.encodePacked(address(this),handle1,timestamp,sig1,handle2));
  }

  function metaConnect(bytes32 handle1, uint256 timestamp, bytes32 handle2, bytes sig1, bytes sig2) public {

      bytes32 _hash1 = getHash1(handle1,timestamp);
      bytes32 _hash2 = getHash2(handle1,timestamp,sig1,handle2);

      address from;
      address to;

      bytes32 r;
      bytes32 s;
      uint8 v;

      if (sig1.length != 65 || sig2.length != 65) {
        revert("MetaConnect::metaConnect Signature Length");
      }

      assembly {
        r := mload(add(sig1, 32))
        s := mload(add(sig1, 64))
        v := byte(0, mload(add(sig1, 96)))
      }
      // Version of signature should be 27 or 28, but 0 and 1 are also possible versions
      if (v < 27) {
        v += 27;
      }
      // If the version is correct return the signer address
      if (v != 27 && v != 28) {
        revert("MetaConnect::metaConnect Incorrect Version 1");
      } else {
        // solium-disable-next-line arg-overflow
        from = ecrecover(keccak256(
          abi.encodePacked("\x19Ethereum Signed Message:\n32", _hash1)
        ), v, r, s);
      }

      assembly {
        r := mload(add(sig2, 32))
        s := mload(add(sig2, 64))
        v := byte(0, mload(add(sig2, 96)))
      }
      // Version of signature should be 27 or 28, but 0 and 1 are also possible versions
      if (v < 27) {
        v += 27;
      }
      // If the version is correct return the signer address
      if (v != 27 && v != 28) {
        revert("MetaConnect::metaConnect Incorrect Version 2");
      } else {
        // solium-disable-next-line arg-overflow
        to = ecrecover(keccak256(
          abi.encodePacked("\x19Ethereum Signed Message:\n32", _hash2)
        ), v, r, s);
      }

      emit MetaConnection(msg.sender,from,to,handle1,handle2);
  }
  // when some frontends see that a tx is made from a bouncerproxy, they may want to parse through these events to find out who the signer was etc
  event MetaConnection(address miner, address indexed from, address indexed to, bytes32 fromHandle, bytes32 toHandle);

}

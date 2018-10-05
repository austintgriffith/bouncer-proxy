#!/bin/bash
if [ -z "$network" ]; then
  network="local"
fi

echo "Launching Meta Transaction ⛏️ miner with network [ $network ]..."

if [ "$network" = "rinkeby" ]; then
  echo "Launching Rinkeby Geth..."
  /usr/bin/geth --rinkeby --syncmode "light" --cache 512 --maxpeers 25 --datadir ".geth-rinkeby" --rpc --rpcaddr 0.0.0.0 --rpcapi="db,eth,net,web3,personal" > geth.log 2>&1 &
elif [ "$network" = "ropsten" ]; then
  echo "Launching Ropsten Geth..."
  /usr/bin/geth --testnet --syncmode "light" --cache 512 --maxpeers 25 --datadir ".geth-ropsten" --rpc --rpcaddr 0.0.0.0 --rpcapi="db,eth,net,web3,personal" > geth.log 2>&1 &
else
  echo "Launching Mainnet Geth..."
  /usr/bin/geth --syncmode "light" --cache 512 --maxpeers 25 --datadir ".geth" --rpc --rpcaddr 0.0.0.0 --rpcapi="db,eth,net,web3,personal" > geth.log 2>&1 &

fi

ln -s /node_modules /backend/node_modules

#mount --bind /node_modules /backend/node_modules
#fire up the backend here

bash

#!/bin/bash

#THIS ONLY WORKS ON THE MAINNET NEED TO USE DIFFERENT FOLDER FOR TESTNETS
docker exec -ti metatxrelay bash ic "sudo geth attach --datadir '/root/.ethereum'"

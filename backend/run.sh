#!/bin/bash
rm -rf redisdata/ ; ./redis.sh  ; nodemon index.js

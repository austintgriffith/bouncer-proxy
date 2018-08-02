#!/bin/bash
docker rm -f bouncer-proxy-redis
docker run --name bouncer-proxy-redis -v ${PWD}/redisdata:/data -p 57300:6379 -d redis redis-server --appendonly yes

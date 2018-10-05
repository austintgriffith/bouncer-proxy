#!/bin/bash
docker tag metatxrelay austingriffith/metatxrelay:$1
docker tag metatxrelay austingriffith/metatxrelay:latest
docker push austingriffith/metatxrelay

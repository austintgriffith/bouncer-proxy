#!/bin/bash
osascript -e 'tell application "iTerm"
activate
create window with profile "Default"
tell the current window
tell the current session
delay 1
write text "npm start"
delay 1
end tell
end tell
end tell'
osascript -e 'tell application "iTerm"
activate
create window with profile "Default"
tell the current window
tell the current session
delay 1
write text "ganache-cli"
delay 1
end tell
end tell
end tell'
osascript -e 'tell application "iTerm"
activate
create window with profile "Default"
tell the current window
tell the current session
delay 1
write text "cd backend;sleep 15;./redis.sh;nodemon index.js"
delay 1
end tell
end tell
end tell'
#tell application "Chrome"
#	open location "http://localhost:8000"
#end tell'
atom . -n
clevis test full
## you also need to pull in repos like zep
##
## I also had to:
## sudo npm install -g scrypt
## install "scrypt" manually ("sudo npm install -g scrypt")
## go to "ethereum-testrpc module folder"/node_modules/scrypt
## mv build buildold
## make a symbolic link to scrypt build folder e.g. "ln -s /usr/local/lib/node_modules/scrypt/build"
## then I got in there
## and did cp scrypt.node scrypt
##https://github.com/trufflesuite/ganache-cli/issues/134


## I went to /Users/austingriffith/cryptogs/gatsby-site/node_modules/scrypt
## mv build buildold
## ln -s /usr/local/lib/node_modules/scrypt/build
##
## had to move my ~/.node-gyp folder and regen

!#/bin/bash

# this is the script that gets called by cron
# it executes the subscriptiondownloader node app

export PATH=/opt/node/bin/node:$PATH
export NODE_PATH=/opt/node/bin/node/node_modules

node subscriptiondownloader > /dev/null 2>&1
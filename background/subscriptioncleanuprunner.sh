!#/bin/bash

# this is the script that gets called by cron
# it executes the subscriptioncleanup node app

export PATH=/opt/node/bin/node:$PATH
export NODE_PATH=/opt/node/bin/node/node_modules

node subscriptioncleanup > /dev/null 2>&1
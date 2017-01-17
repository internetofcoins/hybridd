#!/bin/sh
# (Re)Starts a docker instance for hybridd-plugin-btc

# initialization variables
DOCKNAME="hybridd-asset-btc"
PORTLISTEN=1234		# docker listens on this port
PORTTARGET=8332		# target port inside the docker image

# stop/destroy old instances
docker stop $DOCKNAME
docker rm $DOCKNAME

# start new docker instance (deamonized)
docker run --name $DOCKNAME -p 127.0.0.1:$PORTLISTEN:$PORTTARGET \
-v /home/agent725/bitcoin:/root/.bitcoin \
-d $DOCKNAME initialize

#!/bin/sh
# (Re)Starts a docker instance for hybridd-asset-xcp

# initialization variables
DOCKNAME="hybridd-asset-xcp"
HYBRIDPATH="/home/agent725/hybridd"
PORTLISTENBTC=1234	# docker listens on this port for BTC
PORTTARGETBTC=8332	# target port inside the docker image
PORTLISTENXCP=2345	# docker listens on this port for XCP
PORTTARGETXCP=4001	# counterblock target port inside the docker image

# stop/destroy old instances
docker stop $DOCKNAME
docker rm $DOCKNAME

# start new docker instance (deamonized)
docker run --name $DOCKNAME \
-p 127.0.0.1:$PORTLISTENBTC:$PORTTARGETBTC \
-p 127.0.0.1:$PORTLISTENXCP:$PORTTARGETXCP \
-v $HYBRIDPATH/storage/asset/btc:/root/.bitcoin \
-v $HYBRIDPATH/storage/asset/xcp:/root/.config \
-v $HYBRIDPATH/storage/asset/xcp:/root/.local/share/ \
-v $HYBRIDPATH/storage/asset/xcp/counterwallet:/home/xcp/counterwallet \
-i $DOCKNAME /root/.local/share/initialize
# TEST/DEBUG
#-i $DOCKNAME /bin/bash

# BTC bitcoind container
FROM ubuntu:14.04.1
MAINTAINER AmmO <holosphere@xs4all.nl>
RUN echo "deb http://ppa.launchpad.net/bitcoin/bitcoin/ubuntu trusty main\ndeb-src http://ppa.launchpad.net/bitcoin/bitcoin/ubuntu trusty main" >> /etc/apt/sources.list
RUN apt-get update && apt-get install -y add-apt-key
RUN add-apt-key D46F45428842CE5E
RUN apt-get update && apt-get install -y bitcoind


# BTC bitcoind container
FROM ubuntu:14.04.1
MAINTAINER Agent725 <agent725@725.be>
RUN apt-get update && apt-get install -y wget sudo
RUN wget -q -O /tmp/fednode_run.py https://raw.github.com/CounterpartyXCP/federatednode_build/master/run.py
RUN sudo python3 /tmp/fednode_run.py


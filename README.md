<img align="right" height="32" src="https://coinstorm.net/ioc_logo_fund.png">

# Internet of Coins hybridd node system

## Overview

This repository hosts the Internet of Coins <i>hybridd</i> node system. Our codebase is mainly NodeJS, with modules that can be written in other languages as well. This code is currently under heavy development, and subject to changes at any moment.

## getting started

### installing hybridd

To get started with hybridd, perform the following steps on a GNU/Linux system (at the moment Debian 8 'jessie' is our reference system, but Debian 9 'stretch' should work also). To maintain security, we recommend to install the 'unattended-upgrades' package for automatic security updates. We are sorry that we cannot provide support for running on proprietary systems, but our build is compatible with the Darwin operating system (pilfered from FreeBSD) underneath Big Mac OS X. 

```
git clone https://github.com/internetofcoins/hybridd
```

### dependencies

Hybridd depends on [electrum client](https://download.electrum.org) to communicate with the Bitcoin blockchain (because why should we reinvent the wheel). The electrum download site provides the following build instructions.

Install dependencies for electrum:

```
sudo apt-get install python3-setuptools python3-pyqt5 python3-pip
```

Install electrum:

```
sudo pip3 install https://download.electrum.org/3.0.3/Electrum-3.0.3.tar.gz
```

It is not necessary to go through the electrum setup wizard and create any keys, since electrum is only used as an API and hybridd does not permanently store any keys. Hybridd expects electrum to run on 127.0.0.1:8338 by default. To configure electrum, create the required config file, the following commands should suffice.

```
mkdir ~/.electrum
echo '{ "rpcport":8338 }' > ~/.electrum/config
```
You can now start electrum in daemon mode, so it can serve API requests in the background.

```
electrum daemon &
```

### running hybridd

To fetch any missing nodejs runtime dependencies and (re)generate the views, start hybridd with the following command. 

```
cd hybridd
./coldstart_hybridd
```

## Usage (older manual instructions)

1. Make sure you are running a GNU/Linux system. Clone the hybridd repository.
```
git clone https://github.com/internetofcoins/hybridd
```
2. Clone the nodejs-runtime repository.
```
git clone https://github.com/internetofcoins/nodejs-runtime/
```
3. In the hybridd repository root, make a symbolic link to the correct node version for your system architecture (node32, node64 or nodeARM).
```
cd hybridd
ln -s ../nodejs-runtime/x86_64 node
```

3. Run the <i>hybridd</i> node.
```
~/hybridd$ ./hybridd
```
4. Open http://localhost:8080 to access the GUI wallet. (Make sure you are running the right daemons for coin support. Example: electrum for Bitcoin, which is run using: <i>electrum daemon start</i>.)

5. Open http://localhost:1111 to access the REST API. (We currently use only GET functions for ease of use.)

6. You can also access all REST functions from the command-line in another terminal, once <i>hybridd</i> is running.

### Command examples:
```
./hybridd /asset/lsk/fee
```

```
./hybridd /proc/161803398874989
```

## More information

Right now <i>hybridd</i> works with a REST API, and several cryptocurrency modules. All actions are handled through a processor and scheduler. 
Every command gived to a <i>hybridd</i> module will return a JSON object containing the process number of the action that has been queued into the scheduler. To see the data in that process, you can read it out using the /proc/PROCESS_NUMBER path.
This makes asynchronous requests possible, and by reading the process progress variable, a front-end can be updated as to the real status of a process.

For additional information please visit: https://internetofcoins.org

## Troubleshooting

 <i>What is this supposed to do?</i>
 This <i>hybridd</i> prototype hooks in modules that interface to a few cryptocurrencies. At the moment mostly interesting for tech enthousiasts to experiment with.
 
 <i>Can I use my own version of NodeJS?</i>
 We have included a 32-bit, 64-bit and ARMv7 version of NodeJS to make things work out of the box, but you can certainly use your own. Please amend the symbolic link in the root of this repository if necessary, or install NodeJS on your system.

 <i>What if I get an error?</i>
 Make sure you have correctly configured <b>hybridd.conf</b>. Also all recipes JSON files included in ./recipes must be without error. If this does not solve your problem, feel free to share the issue with us.
 
## Authors

Joachim de Koning <joachim@internetofcoins.org>
Amadeus de Koning <amadeus@internetofcoins.org>

Others: many libraries and code snippets contained herein have other authors and their own licensing included.

## License

This work is licensed under the GNU GPLv3 license. (See the LICENSE file in the root of this repository.)

Copyright (c) 2014-2017 Internet of Coins

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

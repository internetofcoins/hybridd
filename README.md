<img align="right" height="32" src="https://coinstorm.net/ioc_logo_fund.png">

# Internet of Coins hybridd node system

## Overview

This repository hosts the Internet of Coins <i>hybridd</i> node system. Our codebase is mainly NodeJS, with modules that can be written in other languages as well. This code is currently under heavy development, and subject to changes at any moment.

## Usage

1. Make sure you are running a GNU/Linux system.
```
git clone https://github.com/internetofcoins/hybridd
```
2. In the repository root, make a symbolic link to the correct node version for your system architecture (node32, node64 or nodeARM).
```
cd hybridd
ln -s node64 node
```

3. Run the <i>hybridd</i> node.
```
~/hybridd$ ./hybridd
```
4. Open http://localhost:8080 to access the GUI wallet. (Make sure you are running the right daemons for coin support. Example: electrum for Bitcoin.)

5. Open http://localhost:1111 to access the REST API. (We currently use only GET functions for ease of use.)

6. You can also access all REST functions from the command-line in another terminal, once <i>hybridd</i> is running.

### Command examples:
```
./hybridd /asset/lsk/status
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
 We have included a 32-bit and 64-bit version of NodeJS to make things work out of the box, but you can certainly use your own. Please amend the symbolic link in the root of this repository if necessary.

 <i>What if I get an error?</i>
 Make sure you have correctly configured <b>hybridd.conf</b>. If this does not solve your problem, feel free to share the issue with us.
 
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

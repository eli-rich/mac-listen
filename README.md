# MAC-SNOOP
An NPM module useful for WiFi password cracking. Useful to use with [hashcat](https://hashcat.net/hashcat/).

This package is only for macOS, I wrote it because a lot of alternatives seemed overly complicated or unavailable on Mac.

 

## Requirements

 1. [Homebrew](https://brew.sh)
 2. [Node.js](https://nodejs.org/en/)
 3. TCPDUMP (preinstalled on macOS AFAIK)
 4. [Wireshark](https://www.wireshark.org/download.html). If you do not have Wireshark, it will be installed on first use.
 5. [Hcxtools](https://github.com/ZerBea/hcxtools). If you do not have these, they will also be installed on first use.

Note: Please make sure these tools are accessible from your command line and added to your path. This is how the CLI detects their installation. Make sure 
`which mergecap` 
and
 `which hcxpcapngtool` 
 both work.

## Installation
```sh
npm i -g mac-snoop
```
```sh
snoop
```
This will automatically install Wireshark and hcxtools.

## Usage
**Example Usage:**
```sh
snoop -o wifihash.hc22000
```
If you haven't installed Wireshark or hcxtools, the CLI will attempt to install them for you with `brew`.
![Install success](https://i.imgur.com/arew3aq.png)
This will print a list of available networks to stdout. You then select them with their ID.
![Select Network Prompt](https://i.imgur.com/9wjl5It.png)

After you select the network, it will capture the network beacon, then start listening for the network handshake.

Once it has collected the handshake packets (i.e, someone has connected to the network). It will then merge the captured files and transform them into a form that `hashcat` can crack.

To crack with hashcat, use `hashcat -m 22000` 

## Options

 - `snoop -v` - gets version number
 - `snoop -h` - displays help
 - `snoop -p` - specifies password for commands (some of them must be run as sudo). If left blank, will prompt user for password.
 - `snoop -o`	 sets the final output file.
 - `snoop -H` sets the handshake file name. Note: this file is deleted after the merge.
 - `snoop -b` sets the beacon file name. Note: this file is deleted after the merge.
 - `snoop -i` sets the network interface to be used. To see a list of interfaces, type:
 ```sh
networksetup -listallhardwareports
 ```
 The default interface is `en0`. On most MacBooks this is the wifi card.

> Written with [StackEdit](https://stackedit.io/).

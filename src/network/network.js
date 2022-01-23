import path from "path";
import fs from "fs/promises";

import ora from "ora";
import prompt from "prompt";

import err from "../error.js";



class Network {
    constructor(sudo, inter) {
        this.bssid = '';
        this.channel = 0;
        this.inter = inter
        this.net = {};

        this.macReg = new RegExp("^([0-9a-fA-F][0-9a-fA-F]:){5}([0-9a-fA-F][0-9a-fA-F])$");
        this.sudo = sudo.exec;
        return this;
    }
    async listInRange() {
        let output;
        try {
            output = await this.sudo("airport -s");
        } catch (error) {
            err(error);
        }
        return this.parseRange(output.stdout);
    }

    async getBeacon(outFile) {
        try {
            await this.sudo("airport -z");
            await this.sudo("airport -c"+this.net.channel);
            await this.sudo(`tcpdump type mgt subtype beacon and ether src ${this.net.mac} -I -c ${this.net.channel} -i ${this.inter} -w ${outFile}`, true);
        } catch (error) {
            err(error);
        }
        
    }

    async getHandshake(outFile) {
        try {
            await this.sudo(`tcpdump ether proto 0x888e and ether host ${this.net.mac} -c 1 -I -U -vvv -i ${this.inter} -w ${outFile}`);
        } catch (error) {
            err(error);
        }
    }
    async merge(paths) {
        let beacon = paths[0];
        let handshake = paths[1];
        let outFile = paths[2];
        let tmp = path.join(path.dirname(beacon), "tmp.cap");
        try {
            await this.sudo(`mergecap -a -F pcap -w ${tmp} ${beacon} ${handshake}`);
            await this.sudo(`hcxpcapngtool -o ${outFile} ${tmp}`);
            await fs.unlink(beacon);
            await fs.unlink(handshake);
            await fs.unlink(tmp);
        } catch (error) {
            err(error);
        }
    }

    async setNet(nets) {
        for (let i = 0; i < nets.length; i ++) {
            console.log('\n');
            console.log("ID: " + (i + 1));
            console.log("SSID: " + nets[i].ssid);
            console.log("MAC: " + nets[i].mac);
            console.log("CHANNEL: " + nets[i].channel);
        }
        console.log("\nSelect network to snoop by entering the ID number");
        let schema = {
            properties: {
                id: {
                    pattern: /^[0-9]*$/,
                    message: "ID must be a number",
                    required: true
                }
            }
        }
        prompt.start();
        let { id } = await prompt.get(schema);
        this.net = nets[id - 1];
        return this.net;
    }

    parseRange(stdout) {
        stdout = stdout.split('\n');
        let nets = [];

        for (let i = 1; i < stdout.length; i ++) {
            let net = {
                ssid: '',
                mac: '',
                channel: -1
            };
            let line = stdout[i].split(/[ ,]+/);
            line.splice(0, 1);
            let mac;
            line.forEach((element, index) => {
                if (this.macReg.test(element) === true) mac = index;
            });

            if (mac === undefined) continue;
            net.mac = line[mac];
            net.channel = parseInt(Math.abs(line[mac + 2]));
            net.ssid = line.slice(0, mac).join('');
            nets.push(net);
        }
        return nets;
    }
}

export default Network;
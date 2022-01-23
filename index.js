#! /usr/bin/env node

import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import ora from "ora";
import { Command } from "commander/esm.mjs";
import chalk from "chalk";

import Sudo from "./src//sudo/sudo.js";
import checkRoot from "./src/sudo/checkroot.js";
import Config from "./src/config/config.js";
import checkInstall from "./src/install/checkinstall.js";
import brew from "./src/install/brew-install.js";
import err from "./src/error.js";
import Network from "./src/network/network.js";

const config = new Config(path.join(__dirname, "src", "config", "config.json"));

const program = new Command();
program
    .version(chalk.green('1.0.0'))
    .option("-p, --password [password]", `specify system password ${chalk.green('(default: <input>)')}`)
    .option("-o, --output [path]", "specifies output file", "hash.hc22000")
    .option("-b, --beacon [path]", "specify beacon file", "beacon.cap")
    .option("-H, --handshake [path]", "specify handshake file", "handshake.cap")
    .option("-i, --interface [interface]", "specify interface", "en0")
    //.option("-l, --list", "lists interfaces", false)
    .option("--install", "installs homebrew", false)
    //.option("-e, --enable", "enable managed mode", false)
    .parse();


const options = program.opts();
const password = options.password;
const sudo = new Sudo(password);
const network = new Network(sudo, options.interface);


execute(options);
async function execute(options) {
    let check = await brew.check();
    if (check === false) {
        if (options.install === true) {
            await brew.install();
            console.log(chalk.green("Brew install script finished..."));
            process.exit();
        } else {
            let e = new Error();
            e.name = "Homebrew not installed...";
            e.message = `You must install homebrew to use this tool.\nRun ${chalk.green('"snoop --install"')} to install.`;
            e.exitCode = 0;
            return err(e);
        }
    }
    let elevated = await checkRoot(sudo, password);
    await config.load();
    await checkInstall(config);
    if (options.enable === true) return await sudo.exec("tcpdump -I -U -vvv -i en0 -G 1");

    let nets = await network.listInRange();
    //console.log(nets);
    await network.setNet(nets);
    console.log("Listening for beacon packets...");
    await network.getBeacon(options.beacon);
    console.log("Listening for handshake packets... will automatically stop when enough are collected.");
    await network.getHandshake(options.handshake);
    console.log("Merging cap files and cleaning...");
    await network.merge([options.beacon, options.handshake, options.output]);
    console.log(chalk.green("Process complete. You may now use hashcat to crack the output."));
    process.exit();
}
#! /usr/bin/env node

import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import { Command } from "commander/esm.mjs";
import chalk from "chalk";
import ora from "ora";

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
    .version(chalk.green('1.0.1'))
    .option("-p, --password [password]", `specify system password ${chalk.green('(default: <input>)')}`)
    .option("-o, --output [path]", "specifies output file", "hash.hc22000")
    .option("-b, --beacon [path]", "specify beacon file", "beacon.cap")
    .option("-H, --handshake [path]", "specify handshake file", "handshake.cap")
    .option("-i, --interface [interface]", "specify interface", "en0")
    .option("-l, --list", "lists Wi-Fi interfaces", false)
    .option("--install", "installs homebrew", false)
    .option("--enable", 
    `${chalk.bold("Enable managed mode")}:
        Sometimes macOS gets stuck in monitor mode.
        This command ${chalk.yellow.italic("should")} fix that.
        After running, whenever your wifi status returns to normal. Use "${chalk.green("Ctrl + C")}" to exit.\n`
        , false)
    .parse();


const options = program.opts();
const password = options.password;
const sudo = new Sudo(password);
const network = new Network(sudo, options.interface);


execute(options);
async function execute(options) {
    let spinner;
    await checkRoot(sudo, password);
    if (options.enable === true) {
        spinner = ora("Enabled monitor mode. Press " + chalk.green("Ctrl + C") + " at any time to exit and switch to managed mode.\n"+chalk.yellow.bold("This should fix any issues if you were previously stuck in monitor mode.")).start();
        await sudo.exec("tcpdump -I -U -vvv -i en0 -G 1");
        process.exit();
    }

    spinner = ora("Checking for homebrew...").start();
    let check = await brew.check();
    if (check === false) {
        spinner.fail("Homebrew not found");
        if (options.install) {
            await brew.install();
            console.log(chalk.green("Homebrew successfully installed!"));
        } else {
            let e = new Error();
            e.name = "Homebrew not installed...";
            e.message = `You must install homebrew to use this tool.\nVisit ${chalk.green('https://brew.sh')} or run ${chalk.green("snoop --install")} to install.`;
            e.exitCode = 0;
            return err(e);
        }
    }
    spinner.succeed();


    if (options.list) {
        spinner = ora("Getting a list of network interfaces...");
        let l = await network.listInterfaces();
        console.log(l.stdout);
        spinner.succeed();
        process.exit(0);
    }

    spinner = ora("Loading configuration file...").start();
    await config.load();
    spinner.succeed();

    spinner = ora("Checking mergecap and hcxpcapngtool installation status...").start();
    await checkInstall(config);
    spinner.succeed();


    spinner = ora("Gathering network information...").start();
    let nets = await network.listInRange();
    spinner.succeed();

    await network.setNet(nets);

    spinner = ora("Listening for beacon packets...").start();
    await network.getBeacon(options.beacon);
    spinner.succeed();

    spinner = ora("Listening for handshake packets... will automatically stop when enough are collected.").start();
    await network.getHandshake(options.handshake);
    spinner.succeed();

    spinner = ora("Merging cap files and cleaning...").start();
    await network.merge([options.beacon, options.handshake, options.output]);
    spinner.succeed();

    console.log(chalk.green("Process complete. You may now use hashcat to crack the output."));
    process.exit();
}
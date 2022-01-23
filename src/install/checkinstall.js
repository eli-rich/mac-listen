import { execaCommand } from "execa";
import ora from "ora";

import hcxtools from "./hcxtools-install.js";
import wireshark from "./wireshark-install.js"

async function checkInstall(config) {

    let wres, hres;
    let hcx, wire;
    try {
        wres = await execaCommand("which mergecap");
        wire = true;
        config.mergecap.installed = true;
        config.mergecap.path = wres.stdout;
    } catch (error) {
        wire = false;
    }
    try {
        hres = await execaCommand("which hcxpcapngtool");
        hcx = true;
        config.hcxpcapngtool.installed = true;
        config.hcxpcapngtool.path = hres.stdout;
    } catch (error) {
        hcx = false;
    }
    let wirepath = '';
    let hcxpath = '';
    let spinner;
    if (!wire || !hcx) spinner = ora("Installing").start();
    if (!wire) {
        spinner.text = "Installing wireshark with brew...";
        wirepath = await wireshark.install();
        spinner.succeed();
    }
    if (!hcx) {
        spinner.text = "Installing hcxtools with brew...";
        if (!spinner.isSpinning) spinner.start();
        hcxpath = await hcxtools.install();
        spinner.succeed();
    }

    if (wirepath !== '') {
        config.mergecap.installed = true;
        config.mergecap.path = wirepath;
    }
    if (hcxpath !== '') {
        config.hcxpcapngtool.installed = true;
        config.hcxpcapngtool.path = hcxpath;
    }

    await config.save();
    return config.mergecap.installed && config.hcxpcapngtool.installed;
}

export default checkInstall;
import { execaCommand } from "execa";
import axios from "axios";
import { writeFile } from "fs/promises";
import err from "../error.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function check() {
    let result;
    try {
        result = await execaCommand("which brew");
    } catch (error) {
        return false;
    }
    return result.stdout;
}

async function install() {
    let error = new Error();
    error.title = "Brew install failed."

    let installsh = "";
    try {
        installsh = await axios.get("https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh");
    } catch (e) {
        error.message = "Failed to download the Brew install script.";
        err(error);
    }
    try {
        await writeFile(path.join(__dirname, "install.sh"), installsh.data);
    } catch (e) {
        error.message = "Failed to write install script to " + path.join(__dirname, "install.sh");
        err(error);
    }
    let res;
    try {
        res = await execaCommand("bash " + path.join(__dirname, "install.sh"), {stdin: process.stdin, stdout: process.stdout});
    } catch(e) {
        err(e);
    }
    return res;
}


const brew = {
    check: check,
    install: install
};

export default brew;
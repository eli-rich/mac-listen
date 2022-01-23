import { execaCommand } from "execa";
import err from "../error.js";

async function check() {
    let result;
    try {
        result = await execaCommand("which brew");
    } catch (error) {
        return false;
    }
    return result.stdout;
}

async function install(stdout) {
    let result;
    try {
        result = await execaCommand(`/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"`);
        result.pipe(stdout);
    } catch (error) {
        return err(error);
    }
    return result.stdout !== '';
}

const brew = {
    check: check,
    install: install
};

export default brew;
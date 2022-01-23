import { execaCommand } from "execa";
import err from "../error.js";


async function install() {
    let install;
    try {
        install = await execaCommand("brew install hcxtools");
    } catch (error) {
        err(error);
    }
    let success;
    try {
        success = await execaCommand("which hcxpcapngtool");
    } catch (error) {
        err(error);
    }
    if (success.stdout !== "") {
        return success.stdout;
    }
}

const hcxtools = {install: install};

export default hcxtools;
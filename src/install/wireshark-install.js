import { execaCommand } from "execa";
import err from "../error.js";


async function install() {
    let install;
    try {
        install = await execaCommand("brew install wireshark");
    } catch (error) {
        err(error);
    }
    let success;
    try {
        success = await execaCommand("which mergecap");
    } catch (error) {
        err(error);
    }
    if (success.stdout !== "") {
        return success.stdout;
    }
}

const wireshark = {install: install};

export default wireshark;
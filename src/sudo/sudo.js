import { execaCommand } from "execa";
import err from "../error.js";
class Sudo {
    constructor(password) {
        this.password = password || undefined;
        return this;
    }
    async exec(command, options) {
        if (this.password !== undefined) {
            command = `-S `.concat(command);
        }
        if (!command.startsWith("sudo ")) command = "sudo ".concat(command);
        let result;
        try {
            if (this.password) options.input = this.password;
            result = await execaCommand(command, options);
        } catch (error) {
            err(error);
        }
        return result;
    }
}

export default Sudo;
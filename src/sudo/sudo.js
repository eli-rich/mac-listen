import { execaCommand } from "execa";
import err from "../error.js";
class Sudo {
    constructor(password) {
        this.password = password || undefined;
        return this;
    }
    async exec(command, askPass = false) {
        if (this.password !== undefined && askPass === false) {
            command = `-S `.concat(command);
        }
        if (!command.startsWith("sudo ")) command = "sudo ".concat(command);
        let result;
        try {
            if (this.password && askPass !== false) result = await execaCommand(command, {input: this.password});
            else result = await execaCommand(command);
        } catch (error) {
            err(error);
        }
        return result;
    }
}

export default Sudo;
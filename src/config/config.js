import fs from "fs/promises";
import err from "../error.js";

class Config {
    constructor(path) {
        this.path = path;
        this.mergecap = {
            installed: false,
            path: ''
        };
        this.hcxpcapngtool = {
            installed: false,
            path: ''
        };
        return this;
    }

    async load() {
        let data;
        try {
            data = await fs.readFile(this.path);
        } catch (error) {
            return err(error);
        }
        data = JSON.parse(data.toString());
        this.mergecap = {...data.mergecap};
        this.hcxpcapngtool = {...data.hcxpcapngtool};
        return true
    }

    async save() {
        let data = {
            mergecap: {...this.mergecap},
            hcxpcapngtool: {...this.hcxpcapngtool}
        };
        try {
            data = await fs.writeFile(this.path, JSON.stringify(data));
        } catch (error) {
            return err(error);
        }
        return true
    }
}


export default Config;
import isRoot from "is-root";
import err from "../error.js";
async function checkRoot(sudo, password) {
    if (isRoot()) return true;
    let result;
    try {
        result = await sudo.exec("-v", password);
    } catch (error) {
        error.name = "Incorrect Password.";
        error.message = error.message.split('\n');
        error.message = error.message[error.message.length - 1];
        return err(error);
    }
    return result == true;
}

export default checkRoot;
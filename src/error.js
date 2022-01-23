import chalk from "chalk";
function err(error, stopProcess = true) {
    let e = new Error();
    e.name = error.name ? error.name : '';
    e.message = error.message ? error.message : '';
    if (error.exitCode) e.exitCode = error.exitCode;
    else if (error.errno) e.exitCode = error.errno;
    else e.exitCode = 0;

    e.stopProcess = stopProcess;
    return output(e);

}

function output(error) {
    if (error.name !== '') {
        console.error(chalk.red.bold.underline("Error: " + (error.name) + '\n'));
    }
    if (error.message !== '') {
        error.message = error.message.split('\n');
        console.error(chalk.red.bold("Message: \n"));
        console.error(chalk.red("\""));
        error.message.forEach(line => {
            return console.error(chalk.red(line.padStart(4)));
        });
        console.error(chalk.red("\n\""));
    }
    if (error.exitCode !== 0) console.error(chalk.red.bold("Exit code: "+chalk.reset.red(error.exitCode.toString())));
    
    if (error.stopProcess) process.exit(error.exitCode);
}

export default err;
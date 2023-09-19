const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const cron = require('node-cron');

// Function to run your script with up to 10 retries on error
function runScriptWithRetries(scriptName, maxRetries = 200) {
    let retries = 0;

    function execute() {
        const logFileName = `${scriptName.replace('.js', '')}_success.log`;
        const logFilePath = path.join(__dirname, logFileName);

        const child = exec(`node ${scriptName}`, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error executing ${scriptName}: ${error}`);
                if (retries < maxRetries) {
                    console.log(`Retrying ${scriptName} (Attempt ${retries + 1}/${maxRetries})...`);
                    retries++;
                    execute(); // Retry
                } else {
                    console.error(`${scriptName} reached max retries. Exiting.`);
                }
            } else {
                console.log(`Output of ${scriptName}: ${stdout}`);
                // Create a log file for successful run
                fs.writeFileSync(logFilePath, `${new Date()}: ${scriptName} completed successfully\n`, { flag: 'a' });
            }
        });

        // Log stdout and stderr to console in real-time
        child.stdout.pipe(process.stdout);
        child.stderr.pipe(process.stderr);
    }

    execute();
}

// Schedule your script to run buy4hh.js every 4 hours
cron.schedule('0 */4 * * *', () => {
    console.log('Running scheduled task...');
    runScriptWithRetries('buy4hh.js');
});


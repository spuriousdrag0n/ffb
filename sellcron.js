const cron = require('node-cron');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

// Function to run your script with continuous retries
function runScript(scriptName, callback) {
    const logFileName = `${scriptName.replace('.js', '')}_success.log`;
    const logFilePath = path.join(__dirname, logFileName);

    const child = exec(`node ${scriptName}`, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error executing ${scriptName}: ${error}`);
            console.log(`Retrying ${scriptName}...`);
            runScript(scriptName, callback); // Retry
        } else {
            // Log the output of sell.js to the console
            console.log(`Output of ${scriptName}: ${stdout}`);
            
            // Create a log file for successful run
            fs.writeFileSync(logFilePath, `${new Date()}: ${scriptName} completed successfully\n`, { flag: 'a' });
            
            callback(); // Execute the next script
        }
    });

    // Pipe the child process stdout and stderr to the parent process
    child.stdout.pipe(process.stdout);
    child.stderr.pipe(process.stderr);
}

console.log('Running scheduled task...');

// Run scripts in a specific orderi
cron.schedule('0 */3 * * *', () => {
runScript('clear_subjects.js', () => {
    runScript('sell.js', () => {
        console.log('All scripts completed.');
    });
   });
});

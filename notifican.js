const axios = require('axios');
const cron = require('node-cron');
require('dotenv').config();

const apiKey = process.env.ETHERSCAN_API_KEY; // Replace with your Etherscan API key
const address = process.env.PUBLIC_KEY; // Replace with the Ethereum address you want to query

// Base API URL
const apiUrl = 'https://api.basescan.org/api';

// Function to fetch the last 10 transactions with methods
async function getLast10TransactionsWithMethods() {
    try {
        const response = await axios.get(apiUrl, {
            params: {
                module: 'account',
                action: 'txlist',
                address: address,
                startblock: 0, // Start block number (optional, use 0 for entire history)
                endblock: 'latest', // End block number (optional, use 'latest' for current block)
                sort: 'desc', // Sort order (desc for most recent)
                apiKey: apiKey,
                offset: 0, // Offset (skip 0 transactions)
                page: 1, // Page number (fetch 1 page)
                limit: 10, // Limit to 10 transactions
            },
        });

        const transactions = response.data.result;

        if (transactions.length > 0) {
            console.log('Last 10 Transactions with Methods:');
            let found = false;

            const currentTime = Math.floor(Date.now() / 1000); // Current time in seconds

            transactions.slice(0, 10).forEach((transaction, index) => {
                const transactionTime = parseInt(transaction.timeStamp);

                // Calculate the time difference in seconds
                const timeDifference = currentTime - transactionTime;

                if (timeDifference <= 7200) {
                    // Transaction is not older than 2 hours
                    console.log(`Transaction ${index + 1}:`);
                    console.log(`Hash: ${transaction.hash}`);
                    console.log(`From: ${transaction.from}`);
                    console.log(`To: ${transaction.to}`);
                    console.log(`Value: ${transaction.value}`);
                    console.log(`Gas Price: ${transaction.gasPrice}`);
                    console.log(`Gas Used: ${transaction.gasUsed}`);
                    console.log(`Block Number: ${transaction.blockNumber}`);
                    console.log(`Timestamp: ${new Date(transaction.timeStamp * 1000).toUTCString()}`);
                    console.log(`Method: ${transaction.methodId}`);

                    if (transaction.methodId === '0x6945b123' || transaction.methodId === '0xb51d0534') {
                        found = true;
                    }

                    console.log('-------------------');
                }
            });

            if (!found) {
                sendNotification();
            }
        } else {
            console.log('No transactions found.');
            sendNotification();
        }
    } catch (error) {
        console.error('Error fetching transaction history:', error);
    }
}

// Function to send a notification
function sendNotification() {
    const notificationUrl = 'https://api.pushcut.io/Kup3mi0q55Am7BWU-NvF9/notifications/No%20sell%20or%20buy';

    axios.post(notificationUrl)
        .then(response => {
            console.log('Notification sent successfully:', response.data);
        })
        .catch(error => {
            console.error('Error sending notification:', error);
        });
}

// Schedule the script to run every hour
  cron.schedule('0 * * * *', () => {
    console.log('Running script to check transactions...');
    getLast10TransactionsWithMethods();
});


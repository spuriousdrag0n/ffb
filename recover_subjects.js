const { ethers } = require('ethers');
const fs = require('fs');
require('dotenv').config();

let rpc = 'https://base.meowrpc.com';
const provider = new ethers.JsonRpcProvider(rpc);

const privateKey = process.env.PRIVATE_KEY;
const publicKey = process.env.PUBLIC_KEY;
const wallet = new ethers.Wallet(privateKey, provider);

const friendContractAddress = '0xCF205808Ed36593aa40a44F10c7f7C2F67d4A4d4';
const friendABI = require('./ABI/friendABI.json');
const contract = new ethers.Contract(friendContractAddress, friendABI, wallet);

async function start() {
    async function readEventsAndRetrieveInputData(fromBlock, toBlock) {
        const eventName = 'Trade';
        const filter = contract.filters[eventName]();
        const events = await contract.queryFilter(filter, fromBlock, toBlock);
        events.forEach(event => {
            const traderAddress = event.args.trader;
            console.log('Trader Address:', traderAddress);
            const subjectAddress = event.args.subject;
            console.log('Shares Subject:', subjectAddress);
            const blockNumber = event.blockNumber;
            console.log('Block Number:', blockNumber);
            if (traderAddress.toLowerCase() === publicKey.toLowerCase()) {
                const jsonData = JSON.stringify(subjectAddress, null, 2);
                fs.appendFileSync('recoveredSubjects.json', jsonData + ',\n');
            }
        });
    }
    try {
        const latestBlock = await provider.getBlockNumber();
        const batchSize = 1000;
        let fromBlock = 2710000;
        while (fromBlock < latestBlock) {
            try {
                const toBlock = Math.min(fromBlock + batchSize - 1, latestBlock);
                await readEventsAndRetrieveInputData(fromBlock, toBlock);
                fromBlock = toBlock + 1;
                await new Promise(resolve => setTimeout(resolve, 1000));
            } catch (error) {
                console.error('Error:', error);
                console.log('Retrying in 5 seconds...');
                await new Promise(resolve => setTimeout(resolve, 5000));
            }
        }
    } catch (error) {
        console.error('TOO MANY REQUEST');
    }
}
start();
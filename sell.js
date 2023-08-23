require('dotenv').config();
const { ethers } = require('ethers');
const fs = require('fs');

let rpc = 'https://base.meowrpc.com';
const provider = new ethers.JsonRpcProvider(rpc);

const privateKey = process.env.PRIVATE_KEY;
const wallet = new ethers.Wallet(privateKey, provider);

const friendContractAddress = '0xCF205808Ed36593aa40a44F10c7f7C2F67d4A4d4';
const friendABI = require('./ABI/friendABI.json');

const contract = new ethers.Contract(friendContractAddress, friendABI, wallet);

async function start() {
    try {
        const savedSubjectsData = fs.readFileSync('clean_subjects.json');
        const savedSubjects = JSON.parse(savedSubjectsData);

        let amount = 1;

        for (const address of savedSubjects) {
            try {
                const sellPriceAfterFee = await contract.getSellPriceAfterFee(address, amount);
                console.log(`Sell Price for ${address} => ${sellPriceAfterFee.toString()}`);
                if (sellPriceAfterFee >= 1000000000000000) {
                    try {
                        const transaction = await contract.sellShares(address, amount);
                        await transaction.wait();
                        console.log(`Sold shares for ${address}`);
                        //Need to delete the address inside clean_subjects.json
                        //Loop
                    } catch (sellError) {
                        console.error(`Error selling shares for ${address}:`, sellError);
                    }
                } else {
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
            } catch (error) {
                console.error(`Error calling getSellPriceAfterFee for ${address}:`, error);
            }
        }
    } catch (error) {
        console.error('Error reading saved_subjects.json:', error);
    }
}
start();

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
    try {
        const savedSubjectsData = fs.readFileSync('../ffbdata/clean_subject.json');
        let savedSubjects = JSON.parse(savedSubjectsData);

        let amount = 1;

        // Create an array to store promises for selling shares
        const sellPromises = [];

        for (const address of savedSubjects) {
            try {
                const subjectShares = await contract.sharesBalance(address, publicKey);
                const requiredBalance = amount;

                if (subjectShares >= requiredBalance) {
                    const sellPriceAfterFee = await contract.getSellPriceAfterFee(address, amount);
                    console.log(`Sell Price for ${address} => ${sellPriceAfterFee.toString()}`);
                    if (sellPriceAfterFee >= 210000000000000) {
                        savedSubjects = savedSubjects.filter(subject => subject !== address);
                        console.log('🔥 Selling for =>', sellPriceAfterFee.toString())
                        const sellPromise = contract.sellShares(address, amount);
                        sellPromises.push(sellPromise);
                    } else {
                        await new Promise(resolve => setTimeout(resolve, 1000));
                    }
                } else {
                    savedSubjects = savedSubjects.filter(subject => subject !== address);
                }
            } catch (error) {
                console.error(`Error calling sharesBalance for ${address}:`, error);
            }
        }

        // Wait for all sell promises to complete
        await Promise.all(sellPromises);

        // Write the updated data back to the file
        fs.writeFileSync('../ffbdata/clean_subject.json', JSON.stringify(savedSubjects, null, 2));
    } catch (error) {
        console.error('Error reading saved_subjects.json:', error);
    }
}

start();


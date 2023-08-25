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
        const savedSubjectsData = fs.readFileSync('../ffb_data/clean_subject.json');
        let savedSubjects = JSON.parse(savedSubjectsData);

        let amount = 1;

        for (const address of savedSubjects) {
            try {
                const subjectShares = await contract.sharesBalance(address, publicKey);
                const requiredBalance = amount;

                if (subjectShares >= requiredBalance) {
                    const sellPriceAfterFee = await contract.getSellPriceAfterFee(address, amount);
                    console.log(`Sell Price for ${address} => ${sellPriceAfterFee.toString()}`);
                    if (sellPriceAfterFee >= 56250000000001) {
                        try {
                            savedSubjects = savedSubjects.filter(subject => subject !== address);
                            fs.writeFileSync('../ffb_data/clean_subject.json', JSON.stringify(savedSubjects, null, 2));
                            const transaction = await contract.sellShares(address, amount);
                            await transaction.wait();
                            console.log(`Sold shares for ${address}`);
                        } catch (sellError) {
                            console.error(`Error selling shares for ${address}:`, sellError);
                        }
                    } else {
                        await new Promise(resolve => setTimeout(resolve, 1000));
                    }
                } else {
                    savedSubjects = savedSubjects.filter(subject => subject !== address);
                    fs.writeFileSync('../ffb_data/clean_subject.json', JSON.stringify(savedSubjects, null, 2));
                }
            } catch (error) {
                console.error(`Error calling sharesBalance for ${address}:`, error);
            }
        }
    } catch (error) {
        console.error('Error reading saved_subjects.json:', error);
    }
}
start();

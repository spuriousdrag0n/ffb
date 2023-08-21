require('dotenv').config();
const { ethers } = require('ethers');
const fs = require('fs');

const rpc = 'https://base.meowrpc.com';
const provider = new ethers.JsonRpcProvider(rpc);

const privateKey = process.env.PRIVATE_KEY;
const wallet = new ethers.Wallet(privateKey, provider);

const friendContractAddress = '0xCF205808Ed36593aa40a44F10c7f7C2F67d4A4d4';
const friendABI = require('./ABI/friendABI.json');

const contract = new ethers.Contract(friendContractAddress, friendABI, wallet);

const savedSubjectsFilePath = 'saved_subjects.json';

async function saveSubject(subject) {
    try {
        let existingSubjects = [];
        if (fs.existsSync(savedSubjectsFilePath)) {
            existingSubjects = JSON.parse(fs.readFileSync(savedSubjectsFilePath));
        }
        existingSubjects.push(subject);
        fs.writeFileSync(savedSubjectsFilePath, JSON.stringify(existingSubjects, null, 2));
        console.log('Subject saved to file.');
    } catch (error) {
        console.error('Error saving subject:', error);
    }
}

console.log('Listening for Trade events...');
contract.on('Trade', async (trader, subject, isBuy, shareAmount, ethAmount, protocolEthAmount, subjectEthAmount, supply) => {
    try {
        if (ethAmount === 0n) {
            console.log('ethAmount is 0, calling buyShares function...');

            const sharesSubject = subject;
            const amount = 1;

            saveSubject(subject);

            try {
                const txObject = {
                    to: friendContractAddress,
                    value: 70000000000000,
                    data: contract.interface.encodeFunctionData('buyShares', [sharesSubject, amount]),
                };

                const gasLimit = await wallet.estimateGas(txObject);
                console.log(gasLimit);

                const tx = await contract.buyShares(sharesSubject, amount, {
                    value: 70000000000000,
                    gasLimit: gasLimit,
                });

                await tx.wait();
                console.log('buyShares function called successfully.');
                await new Promise(resolve => setTimeout(resolve, 5000));
            } catch (error) {
                console.error('Error calling buyShares:', error);
                await new Promise(resolve => setTimeout(resolve, 5000));
            }
        }
    } catch (error) {
        console.error('Error with Trade event listener:', error);
    }
});

// Handle errors that might occur
// contract.on('error', (error) => {
//     console.error('Error with contract.on:', error);
// });


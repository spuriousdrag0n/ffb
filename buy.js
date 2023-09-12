const { ethers } = require('ethers');
const fs = require('fs');

require('dotenv').config();

const rpc = 'https://base.meowrpc.com';

let provider;

async function initializeProvider() {
    while (true) {
        try {
            provider = new ethers.JsonRpcProvider(rpc);
            console.log('Provider initialized successfully.');
            break;
        } catch (error) {
            console.error('Error initializing provider:', error);
            console.log('Retrying in 5 seconds...');
            await new Promise(resolve => setTimeout(resolve, 5000));
        }
    }
}

initializeProvider();

const privateKey = process.env.PRIVATE_KEY;
const wallet = new ethers.Wallet(privateKey, provider);

const friendContractAddress = '0xCF205808Ed36593aa40a44F10c7f7C2F67d4A4d4';
const friendABI = require('./ABI/friendABI.json');

const contract = new ethers.Contract(friendContractAddress, friendABI, wallet);

const savedSubjectsFilePath = '../ffbdata/saved_subjects.json';

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

const initialMinEthBalance = 8000000000000000; // Initial minimum ETH balance
const timestamp = 1694046917; // Timestamp when the script started

async function checkBalanceAndBuy() {
    try {
        const currentTime = Math.floor(Date.now() / 1000); // Current timestamp in seconds
        const hoursElapsed = (currentTime - timestamp) / 3600; // Hours elapsed since the script started

        // Calculate the updated minimum ETH balance with a 1% increase for every 24 hours
        const minEthBalance = initialMinEthBalance * Math.pow(1.05, hoursElapsed / 24);

        const ethBalance = await provider.getBalance(wallet.address);
        console.log(`Ethereum balance for wallet: ${ethBalance.toString()}`);
        console.log(`Minimum ETH balance required: ${minEthBalance}`);

        if (ethBalance < minEthBalance) {
            console.log('Ethereum balance is less than the required minimum. Exiting the script.');
            return; // Exit the script
        }

        console.log('Listening for Trade events...');
        contract.on('Trade', async (trader, subject, isBuy, shareAmount, ethAmount, protocolEthAmount, subjectEthAmount, supply) => {
            try {
                console.log(`isBuy: ${isBuy}, supply: ${supply}`);
                if (isBuy === true && (supply == 2 || supply == 3)) {
                    console.log(`Buying subject ${subject} with supply ${supply}...`);
                     saveSubject(subject); 
                    const sharesSubject = subject;
                    const amount = 1;
                    
                    // Calculate the value for the transaction
                    const getBuyPriceAfterFee = await contract.getBuyPriceAfterFee(subject, amount);
                    console.log(`buy Price for ${subject} => ${getBuyPriceAfterFee.toString()}`);
                    
                    try {
                        const txObject = {
                            to: friendContractAddress,
                            value: getBuyPriceAfterFee,
                            data: contract.interface.encodeFunctionData('buyShares', [sharesSubject, amount]),
                        };

                        const gasLimit = await wallet.estimateGas(txObject);
                        console.log(`Gas Limit: ${gasLimit.toString()}`);

                        const tx = await contract.buyShares(sharesSubject, amount, {
                            value: getBuyPriceAfterFee,
                            gasLimit: gasLimit + BigInt(5000), // Add 5000 to the gas limit
                        });

                        await tx.wait();
                        await new Promise(resolve => setTimeout(resolve, 10000));
                        if (tx.hash) {
                            console.log('Transaction was successful.');
                           // Save subject after successful transaction
                        } else {
                            console.log('Transaction failed.');
                            await new Promise(resolve => setTimeout(resolve, 5000));
                        }
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

    } catch (error) {
        console.error('Error checking balance and buying:', error);
    }
}

checkBalanceAndBuy();


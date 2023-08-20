require('dotenv').config();
const { ethers } = require('ethers');

let rpc = 'https://base.meowrpc.com';
const provider = new ethers.JsonRpcProvider(rpc);

const privateKey = process.env.PRIVATE_KEY;
const wallet = new ethers.Wallet(privateKey, provider);

const friendContractAddress = '0xCF205808Ed36593aa40a44F10c7f7C2F67d4A4d4';
const friendABI = require('./ABI/friendABI.json');

const contract = new ethers.Contract(friendContractAddress, friendABI, wallet);

async function start() {
    try {
        contract.on('Trade', async (trader, subject, isBuy, shareAmount, ethAmount, protocolEthAmount, subjectEthAmount, supply) => {
            console.log('Trade Event:', {
                trader, subject, isBuy, shareAmount, ethAmount, protocolEthAmount, subjectEthAmount, supply
            });

            if (ethAmount === 0n) {
                console.log('ethAmount is 0, calling buyShares function...');

                const sharesSubject = subject;
                const amount = 1;

                try {
                    const tx = await contract.buyShares(sharesSubject, amount, {
                        value: 70000000000000, //VALUE FOR 1
                    });
                    await tx.wait();
                    console.log('buyShares function called successfully.');
                    start();
                } catch (error) {
                    console.error('Error calling buyShares:', error);
                    start();
                }
            }
        });

        console.log('Listening for Trade events...');
    } catch (error) {
        console.error('Error with RPC');
        console.log('finished?')

    }
}

start();
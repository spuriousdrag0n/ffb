require('dotenv').config();
const { ethers } = require('ethers');

const rpc = 'https://base.meowrpc.com';
const provider = new ethers.JsonRpcProvider(rpc);

const privateKey = process.env.PRIVATE_KEY;
const wallet = new ethers.Wallet(privateKey, provider);

const friendContractAddress = '0xCF205808Ed36593aa40a44F10c7f7C2F67d4A4d4';
const friendABI = require('./ABI/friendABI.json');

const contract = new ethers.Contract(friendContractAddress, friendABI, wallet);

async function start() {
    try {
        contract.on('Trade', (trader, subject, isBuy, shareAmount, ethAmount, protocolEthAmount, subjectEthAmount, supply) => {
            console.log('Trade Event:', {
                trader, subject, isBuy, shareAmount, ethAmount, protocolEthAmount, subjectEthAmount, supply
            });
        });
        console.log('Listening for Trade events...');
    } catch (error) {
        console.error('Error:', error);
    }
}

start();

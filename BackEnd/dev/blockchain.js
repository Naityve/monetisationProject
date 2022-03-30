/*

*/


const { system } = require('nodemon/lib/config');
const sha256 = require('sha256');
const { v1: uuidv1 } = require('uuid');
const currentNodeUrl = process.argv[3];

function Blockchain() {
    /*
    chain is an array that contains all the mined blocks of the Blockchain
    */
    this.chain = [];

    /*
    pendingTransactions is an array that contains all submitted transactions that have yet not been indexed into a block and mined
    */

    this.pendingTransactions = [];

    //Url of Node which is running this instance of the chain

    this.currentNodeUrl = currentNodeUrl;

    //Urls of current network nodes

    this.networkNodes = [];

    //Node urls that are eligable for rewards

    this.whitelist = [];

    //Genesis

    this.createNewBlock(0,'0','0');
}

Blockchain.prototype.createNewBlock = function(nonce, previousBlockHash, hash) {
    const newBlock = {
        index: this.chain.length + 1,
        timestamp: Date.now(),
        transactions: this.pendingTransactions,
        nonce: nonce,
        hash: hash,
        previousBlockHash: previousBlockHash
    };

    this.pendingTransactions = []; //incoming transactions array is reset once current incoming transactions have been blocked 
    this.chain.push(newBlock); //created new block is pushed onto the chain

    return newBlock;
}

// getLastBlock fetches the index of the previous block in the chain

Blockchain.prototype.getLastBlock = function() {    
    return this.chain[this.chain.length - 1];
}

// createNewTransaction generates a transaction object

Blockchain.prototype.createNewTransaction = function(amount, sender, recipient) {
    const newTransaction = {
        amount: amount,
        sender: sender,
        recipient: recipient,
        transactionId: uuidv1().split('-').join('')
    };
    return newTransaction;
}

Blockchain.prototype.createNewAddress = function(login, password) {
    const newAddress = {
        login: login,
        password: password,
        address: uuidv1().split('-').join('')
    };
    return newAddress;
}

// sendNewTransaction pushes a new transaction object into the pendingTransactions array

Blockchain.prototype.sendNewTransaction = function(newtransaction) {
    this.pendingTransactions.push(newtransaction);
    return this.getLastBlock(['index']) + 1;
}

Blockchain.prototype.sendNewAddress = function(newAddress) {
    this.pendingTransactions.push(newAddress);
    return this.getLastBlock(['index']) + 1;
}


Blockchain.prototype.hashBlock = function(previousBlockHash, currentBlockData, nonce) {
    const dataAsString = previousBlockHash + nonce.toString() + JSON.stringify(currentBlockData); //Combines function parameters into a single string
    const hash = sha256(dataAsString); //creates a single string hash of dataAsString
    
    return hash;
}

Blockchain.prototype.proofOfWork = function(previousBlockHash, currentBlockData) {
    let nonce = 0;
    let hash = this.hashBlock(previousBlockHash, currentBlockData, nonce);

    while(hash.substring(0,5) != '00000') {
        nonce++;
        hash = this.hashBlock(previousBlockHash, currentBlockData, nonce);
    }

    return nonce;
}

// Method for comparing the chains hosted on other network nodes to the current chain on the current node

Blockchain.prototype.chainIsValid = function(chain) {
    
    let validChain = true;

    for(var i = 1; i < chain.length; i++) {
        const currentBlock = chain[i];
        const previousBlock = chain[i-1];
        const currentBlockData = {
            transactions: currentBlock['transactions'],
            index: currentBlock['index']
        }
        const blockHash = this.hashBlock(previousBlock['hash'], currentBlockData, currentBlock['nonce']);

        if (blockHash.substring(0,4) !== '0000') validChain = false;

        if (currentBlock['previousBlockHash'] !== previousBlock['hash']) validChain = false;
    };
    
    const genesisBlock = chain[0];
    const correctNonce = genesisBlock['nonce']; 
    const correctPreviousBlockHash = genesisBlock['previousBlockHash']; 
    const correctHash = genesisBlock['hash']; 

    if (correctNonce !== 0) {
        validChain = false;
    } else if (correctPreviousBlockHash !== '0') {
        validChain = false;
    } else if (correctHash !== '0') {
        validChain = false;
    }
    return validChain
}

Blockchain.prototype.getBlock = function(blockHash) {
    
    let correctBlock = null;

    this.chain.forEach(block => {
        if(block.hash == blockHash) {
            correctBlock = block;
        };
    });
    return correctBlock;
};

Blockchain.prototype.getTransaction = function(transactionId) {
    
    let correctTransaction = null;
    let correctBlock = null;
    
    this.chain.forEach(block => {
        block.transactions.forEach(transaction => {
            if(transaction.transactionId == transactionId) {
                correctTransaction = transaction;
                correctBlock = block;
            };
        });
    });
    return {
        transaction: correctTransaction,
        block: correctBlock
    };
};

Blockchain.prototype.getAddressData = function(address) {
    const addressTransactions = [];

    this.chain.forEach(block => {
        block.transactions.forEach(transaction => {
            if(transaction.sender == address || transaction.recipient == address) {
                addressTransactions.push(transaction);
            };
        });
    });

    let balance = 0;

    addressTransactions.forEach(transaction => {
        if(transaction.recipient == address) {
            balance += transaction.amount;
        } else if (transaction.sender == address) {
            balance -= transaction.amount;
        };
    })

    return {
        addressTransactions: addressTransactions,
        addressBalance: balance
    };
};

module.exports = Blockchain;

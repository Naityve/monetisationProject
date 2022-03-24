/*

*/


var express = require('express');
var app = express();
const bodyParser = require('body-parser');
const Blockchain = require('./blockchain');
const { v1: uuidv1 } = require('uuid');
const sha256 = require('sha256');
const port = process.argv[2];
const rp = require('request-promise');

const nodeAddress = sha256(uuidv1().split('-').join(''));

console.log(nodeAddress);

const Chain = new Blockchain();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

//Returns the entire blockchain instance

app.get('/blockchain',function(req,res) {
    res.send(Chain);
});

//Submits a transaction to the PendingTransactions array of the chosen node

app.post('/transaction', function(req,res) {
    const newTransaction = req.body;
    const blockIndex = Chain.sendNewTransaction(newTransaction);

    res.json({ note : `Transaction will be added in block ${blockIndex}` });
});

app.post('/transaction/broadcast', function(req, res) {
    const newTransaction = Chain.createNewTransaction(req.body.amount, req.body.sender, req.body.recipient);
    Chain.sendNewTransaction(newTransaction);

    const requestPromises=[];

    Chain.networkNodes.forEach(networkNodeUrl => {
        const requestOptions = {
            uri : networkNodeUrl + '/transaction',
            method: 'POST',
            body: newTransaction,
            json: true
        };

        requestPromises.push(rp(requestOptions));
    });

    Promise.all(requestPromises).then(data => {
        res.json({ note: 'Transaction created and broadcast SUCCESS.'});
    });
});

//

app.get('/mine',function(req,res) {
    const lastBlock = Chain.getLastBlock();
    const lastBlockHash = lastBlock['hash']; // fetches hash field from the last indexed block

    const currentBlockData = {
        transactions: Chain.pendingTransactions,
        index: lastBlock['index'] + 1
    }

    const nonce = Chain.proofOfWork(lastBlockHash, currentBlockData);

    const blockHash = Chain.hashBlock(lastBlockHash, currentBlockData, nonce);

    const newBlock = Chain.createNewBlock(nonce, lastBlockHash, blockHash);

    const requestPromises = [];

    Chain.networkNodes.forEach(networkNodeUrl => {
        const requestOptions = {
            uri: networkNodeUrl + '/receive-new-block',
            method: 'POST',
            body: { newBlock: newBlock},
            json: true
        };

        requestPromises.push(rp(requestOptions));

    });

    Promise.all(requestPromises).then(data => {
        const requestOptions = {
            uri: Chain.currentNodeUrl + '/transaction/broadcast',
            method: 'POST',
            body: {
                amount: 100,
                sender: "00",
                recipient: nodeAddress 
            },
            json: true
        };

        return rp(requestOptions);

    })
    .then(data => {
        res.json({
            note : "New Block Mined & Broadcast Successfully",
            block : newBlock
        })
    });

    console.log(`\n////////////////////////////////\nNew Block Mined. Block No: ${lastBlock['index'] + 1}\n////////////////////////////////`);

});

app.post('/receive-new-block', function(req,res) {
    const newBlock = req.body.newBlock;
    const lastBlock = Chain.getLastBlock();
    const correctHash = lastBlock.hash === newBlock.previousBlockHash;
    const correctIndex = lastBlock['index'] + 1 === newBlock['index'];

    if(correctHash && correctIndex) {
        Chain.chain.push(newBlock);
        Chain.pendingTransactions = [];
        res.json({
            note : 'New Block Received and Accepted',
            newBlock : newBlock
        });
    } else {
        res.json({
            note : 'New Block Rejected',
            newBlock : newBlock
        });
    }
});

//Registers node and broadcasts it to the network -> call sent to one existing node in network

app.post('/register-and-broadcast-node', function(req,res) {
    const newNodeUrl = req.body.newNodeUrl; 
    if (Chain.networkNodes.indexOf(newNodeUrl) == -1) Chain.networkNodes.push(newNodeUrl);
    
    const registerNodesPromises = [];

    Chain.networkNodes.forEach(networkNodeUrl => {
        const requestOptions = {
            url: networkNodeUrl + '/register-node',
            method: 'POST',
            body: {newNodeUrl : newNodeUrl},
            json: true
        };

        registerNodesPromises.push(rp(requestOptions));
    });

    Promise.all(registerNodesPromises).then(data => {
        const bulkRegisterOptions = {
            uri: newNodeUrl + '/register-nodes-bulk',
            method: 'POST',
            body: { allNetworkNodes: [...Chain.networkNodes, Chain.currentNodeUrl] },
            json: true
        };

        return rp(bulkRegisterOptions);

    })
    .then(data => {
        res.json({ note: 'New Node Registered Successfully'});
    });
});

//Registers node to the network -> call sent from node that receives "register-and-broadcast-node" to all nodes in the network

app.post('/register-node', function(req, res) {
    const newNodeUrl = req.body.newNodeUrl; // Recieves the body of a post signal with the new node address
    const nodeNotPresent = Chain.networkNodes.indexOf(newNodeUrl) == -1; // Error check to ensure node is not already present in network.
    const notCurrentNodeUrl = Chain.currentNodeUrl !== newNodeUrl; // Error check to ensure the current node being indexed is not the api node.

    // Checks if the currently indexed node is not already indexed in the networkNodes array.
    if (nodeNotPresent && notCurrentNodeUrl) {
        Chain.networkNodes.push(newNodeUrl);
    };

    res.json({note: 'New Node Registered Successfully with Node'});

});

//Register multiple nodes at once -> call sent back from receptor node to registrar node with all urls of existing network nodes

app.post('/register-nodes-bulk', function(req,res) {
    const allNetworkNodes = req.body.allNetworkNodes;
    
    allNetworkNodes.forEach( networkNodeUrl => {
        const nodeNotPresent = Chain.networkNodes.indexOf(networkNodeUrl) == -1;
        const notCurrentNodeUrl = Chain.currentNodeUrl !== networkNodeUrl;
        if(nodeNotPresent && notCurrentNodeUrl) {
            Chain.networkNodes.push(networkNodeUrl);
        }
    });
    res.json({note: 'Bulk Registration Complete'});
});

app.get('/consensus', function(req,res) {
    
    const requestPromises = [];

    Chain.networkNodes.forEach(networkNodeUrl => {
        const requestOptions = {
            uri: networkNodeUrl + '/blockchain',
            method: 'GET',
            json: true
        };

        requestPromises.push(rp(requestOptions));

    });

    Promise.all(requestPromises)
    .then(blockchains => {
        
        const currentChainLength = Chain.chain.length;
        let maxChainLength = currentChainLength;
        let  newLongestChain = null;
        let newPendingTransactions = null;
        
        blockchains.forEach(blockchain => {
            if(blockchain.chain.length > maxChainLength) {
                maxChainLength = blockchain.chain.length;
                newLongestChain = blockchain.chain;
                console.log(newLongestChain);
                newPendingTransactions = blockchain.pendingTransactions;
            };            
        });

        if(!newLongestChain || (newLongestChain && !Chain.chainIsValid(newLongestChain))) {
            res.json({
                note: 'Current chain has not been replaced',
                chain: Chain.chain
            });
        } else if(newLongestChain && Chain.chainIsValid(newLongestChain)) {
            Chain.chain = newLongestChain;
            Chain.pendingTransactions = newPendingTransactions;

            res.json({
                note: 'This chain has been replaced',
                chain: Chain.chain
            });
        };
    });

});

app.get('/block/:blockHash', function(req,res) {
    // E.g. http://localhost:3000/block/Adh17659gaff6872hkb9356ybafg2W2867g
    // The :blockHash parameter is a hash that is passed into the query.
    const blockHash = req.params.blockHash;

    const correctBlock = Chain.getBlock(blockHash);

    if(correctBlock != null) {
        res.json({
            note: 'The Block Has Been found',
            block: correctBlock
        });
    } else {
        res.json({
            note: 'The Block Does Not Exist'
        });
    }
});

app.get('/transaction/:transactionId', function(req,res) {
    const transactionId = req.params.transactionId;

    const transactionData = Chain.getTransaction(transactionId);

    if(transactionData.transaction != null && transactionData.block != null) {
        res.json({
            transaction: transactionData.transaction,
            block: transactionData.block
        });
    } else {
        res.json({
            note: 'Transaction Does Not Exist'
        });
    };
});

app.get('/address/:address', function(req,res) {
    const address = req.params.address;

    const addressData = Chain.getAddressData(address);

    if(addressData == null) {
        res.json({
            note: 'The Address Does Not Exist'
        });
    } else {
        res.json({
            addressData: addressData
        });
    };
});

app.listen(port, function() {
    console.log(`listening on port ${port}...`);
});


/*
    Kacper Florek 2022
*/

const Blockchain = require("./blockchain");
const rp = require('request-promise');

const TestChain = new Blockchain();

const sampleChain = {
    "chain": [
    {
    "index": 1,
    "timestamp": 1525295039150,
    "transactions": [],
    "nonce": 100,
    "hash": "0",
    "previousBlockHash": "0"
    },
    {
    "index": 2,
    "timestamp": 1525295064849,
    "transactions": [],
    "nonce": 18140,
    "hash": "0000b9135b054d1131392c9eb9d03b0111d4b516824a03c35639e12858912100",
    "previousBlockHash": "0"
    },
    {
    "index": 3,
    "timestamp": 1525295150900,
    "transactions": [
    {
    "amount": 12.5,
    "sender": "00",
    "recipient": "555dc5d04e4c11e89b44174d1b876bbf",
    "transactionId": "64b4c6504e4c11e89b44174d1b876bbf"
    },
    {
    "amount": 10,
    "sender": "NNFANSDFHYHTN90A09SNFAS",
    "recipient": "IUW099N0A90WENNU234UFAW",
    "transactionId": "881441704e4c11e89b44174d1b876bbf"
    },
    {
    "amount": 20,
    "sender": "NNFANSDFHYHTN90A09SNFAS",
    "recipient": "IUW099N0A90WENNU234UFAW",
    "transactionId": "8c835b604e4c11e89b44174d1b876bbf"
    },
    {
    "amount": 30,
    "sender": "NNFANSDFHYHTN90A09SNFAS",
    "recipient": "IUW099N0A90WENNU234UFAW",
    "transactionId": "92c6e7304e4c11e89b44174d1b876bbf"
    }
    ],
    "nonce": 59137,
    "hash": "0000c09685e31e57318e569b5fe3ca88ced727a29a0eb9cbea633e05056b4c29",
    "previousBlockHash": "0000b9135b054d1131392c9eb9d03b0111d4b516824a03c35639e12858912100"
    },
    {
    "index": 4,
    "timestamp": 1525295192141,
    "transactions": [
    {
    "amount": 12.5,
    "sender": "00",
    "recipient": "555dc5d04e4c11e89b44174d1b876bbf",
    "transactionId": "97fa3b804e4c11e89b44174d1b876bbf"
    },
    {
    "amount": 40,
    "sender": "NNFANSDFHYHTN90A09SNFAS",
    "recipient": "IUW099N0A90WENNU234UFAW",
    "transactionId": "a5d523504e4c11e89b44174d1b876bbf"
    },
    {
    "amount": 50,
    "sender": "NNFANSDFHYHTN90A09SNFAS",
    "recipient": "IUW099N0A90WENNU234UFAW",
    "transactionId": "a8b55fe04e4c11e89b44174d1b876bbf"
    },
    {
    "amount": 60,
    "sender": "NNFANSDFHYHTN90A09SNFAS",
    "recipient": "IUW099N0A90WENNU234UFAW",
    "transactionId": "ab0347804e4c11e89b44174d1b876bbf"
    },
    {
    "amount": 70,
    "sender": "NNFANSDFHYHTN90A09SNFAS",
    "recipient": "IUW099N0A90WENNU234UFAW",
    "transactionId": "ad9738d04e4c11e89b44174d1b876bbf"
    }
    ],
    "nonce": 16849,
    "hash": "00001f3f4e1635cc930cdc41a954d19bcf457eeba8bf6c7be7aa4fe1489e64d3",
    "previousBlockHash": "0000c09685e31e57318e569b5fe3ca88ced727a29a0eb9cbea633e05056b4c29"
    },
    {
    "index": 5,
    "timestamp": 1525295206369,
    "transactions": [
    {
    "amount": 12.5,
    "sender": "00",
    "recipient": "555dc5d04e4c11e89b44174d1b876bbf",
    "transactionId": "b08f1c104e4c11e89b44174d1b876bbf"
    }
    ],
    "nonce": 40153,
    "hash": "000067295fb567842799b887910fe31cc8ca7544ec15a000b65005f6ac50df21",
    "previousBlockHash": "00001f3f4e1635cc930cdc41a954d19bcf457eeba8bf6c7be7aa4fe1489e64d3"
    },
    {
    "index": 6,
    "timestamp": 1525295212959,
    "transactions": [
    {
    "amount": 12.5,
    "sender": "00",
    "recipient": "555dc5d04e4c11e89b44174d1b876bbf",
    "transactionId": "b90a6f704e4c11e89b44174d1b876bbf"
    }
    ],
    "nonce": 252386,
    "hash": "0000462c88b2814ebb930b13ac3c19dc698b2dca27b0c296e03f8a2ea104f74f",
    "previousBlockHash": "000067295fb567842799b887910fe31cc8ca7544ec15a000b65005f6ac50df21"
    }
    ],
    "pendingTransactions": [
    {
    "amount": 12.5,
    "sender": "00",
    "recipient": "555dc5d04e4c11e89b44174d1b876bbf",
    "transactionId": "bcf84b704e4c11e89b44174d1b876bbf"
    }
    ],
    "currentNodeUrl": "http://localhost:3001",
    "networkNodes": []
    };

    /*

    const newAddress = TestChain.createNewAddress("Jamester", "1234");
    TestChain.sendNewAddress(newAddress);

    console.log(TestChain);

    */

    const { v1: uuidv1 } = require('uuid');
    const sha256 = require('sha256');

    const previousBlockHash = sha256(uuidv1().split('-').join(''));

    const currentBlockData = [
        { transactions: [], index: 2 },
        {
      index: 2,
      timestamp: 1648643325063,
      transactions: [],
      nonce: 85021,
      hash: '00000533d7b3de42c4051cc52167cd46812b0312bebd30c2a114859eecc6202f',
      previousBlockHash: '0'
        }
    ]

    function hashBlock (previousBlockHash, currentBlockData, nonce) {
        const dataAsString = previousBlockHash + nonce.toString() + JSON.stringify(currentBlockData); //Combines function parameters into a single string
        const hash = sha256(dataAsString); //creates a single string hash of dataAsString
        
        return hash;
    }

    function proofOfWork(previousBlockHash, currentBlockData) {
        let nonce = 0;
        let hash = hashBlock(previousBlockHash, currentBlockData, nonce);
        let loop = 1;
    
        hashArray =[];

        while(hash.substring(0,4) != '0000') {
            nonce++;
            hash = hashBlock(previousBlockHash, currentBlockData, nonce);
            console.log("this is loop: " + loop + " " + hash);
            loop++;
            hashArray.push(hash);
        }

        return nonce;
    }

    nonceCount=proofOfWork(previousBlockHash, currentBlockData);

    console.log(nonceCount);



    /*
    const sampleAddress = uuidv1().split('-').join('');
    var checker = false;

    function validator() {
        for(j=1; j<1000000000; j++) {
            var val2 = uuidv1().split('-').join('');
            console.log("checking " + j + " out of 1000000000");
            if(sampleAddress === val2) {
                checker = true;
            };
        };
    };
    validator();
    console.log(checker);

    */

    /*
        CODE TO FETCH GET AND POST REQUESTS FROM CLIENT TO API
    */


    /*
        const apiUrl = 'http://localhost:3001'

        // using fetch() to POST example

        const testData = 50;

        const data = {testData};
        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        };

        fetch('/api', options).then(res => {
            return res.text();
        }).then(data => {
            console.log("This is response", data);  
        });

        // END TEST

        function getAddress() {
            async function getNodeAddress(url) {    
                const response = await fetch(url + '/NodeAddress');

                var data = await response.json();
                console.log(data);
            };
            getNodeAddress(apiUrl);
        };

        function fetchChain() {

            async function getapi(url) {
                const response = await fetch(url + '/blockchain');

                var data = await response.json();
                console.log(data);
            }
            getapi(apiUrl);
        };

        function postTransaction() {

            const transactionData = {
                amount: 100,
                sender: "00",
                recipient: "123"
            };

            const options = {
                method: 'POST',
                headers: {
                'Content-Type': 'application/json'
                },
                body: JSON.stringify(transactionData),
                json: true
            };

            fetch(apiUrl + '/transaction', options);
        };
    */
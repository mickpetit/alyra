var  Web3  =  require('web3');
web3  =  new Web3(new  Web3.providers.HttpProvider('https://ropsten.infura.io/v3/acac0024889c4520adf925fa7211657f'));
console.log('Calling Contract.....');

var  abi  =  [
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "_data",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "address",
                "name": "_addr",
                "type": "address"
            }
        ],
        "name": "dataStored",
        "type": "event"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "x",
                "type": "uint256"
            }
        ],
        "name": "set",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "get",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    }
];
var  addr  =  "0x6bdace84C7f66De19cB423453154C07F6AB8Df60";

var  Contract  =  new web3.eth.Contract(abi, addr);

// FUNCTION must the name of the function you want to call.
await Contract.methods.set(999).send({from: 0x13bc18faeC7f39Fb5eE428545dBba611267AEAa4});
Contract.methods.get().call().then((result) => {
    console.log(result);
})

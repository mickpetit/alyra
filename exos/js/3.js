async function main () {
    // 1. Import des librairies
    var Web3  =  require('web3');
    require('dotenv').config();
    const HDWalletProvider = require('@truffle/hdwallet-provider');

    // 2. Connexion a un RPC via hdwallet
    provider = new HDWalletProvider(`${process.env.MNEMONIC}`, `https://ropsten.infura.io/v3/${process.env.INFURA_ID}`)

    web3 = new Web3(provider);

    // 3. Construction d’un objet de contrat

    var abi =  [
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
    var addr  =  "0x6bdace84C7f66De19cB423453154C07F6AB8Df60";
    var Contract  =  new web3.eth.Contract(abi, addr);

    // 4. Appels des fonctions

    Contract.methods.get().call().then(console.log);

    await Contract.methods.set(5).send({ from:'0x158E07e961F25D0F366dc1603bAD02768a498Cb5' });

    Contract.methods.get().call().then(console.log);

};

main();

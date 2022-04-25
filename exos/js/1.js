var Web3 = require('web3');

web3 = new
Web3(new Web3.providers.HttpProvider('https://mainnet.infura.io/v3/e4c3e83875f24d2891178abee381b935'));

var ethTx = ('0x75153c7d5fb32b47a4d2340697e98f19514c381ffb34414bc70f462fa65da7e4');

web3.eth.getTransaction(ethTx, function(err, result) {

    if (!err && result!== null) {
        console.log(result); // Log all the transaction info
        console.log('From Address: '+ result.from); // Log the from address console.log('To Address: ' +  result.to); // Log the to address
        console.log('Ether Transacted: '+ (web3.utils.fromWei(result.value, 'ether'))); // Get the value, convert from Wei to Ether and log it
    }

    else {
        console.log('Error!', err); // Dump errors here
    }

});

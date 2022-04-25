const path = require("path");

module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // to customize your Truffle configuration!
  contracts_build_directory: path.join(__dirname, "client/src/contracts"),
  networks: {
    development: {
      host: "127.0.0.1",     // Localhost (default: none)
      port: 8545,            // Standard Ethereum port (default: none)
      network_id: "*",       // Any network (default: none)
    },
    ropsten: {
      provider : function() {return new HDWalletProvider({mnemonic:{phrase:`${process.env.MNEMONIC}`},providerOrUrl:`https://ropsten.infura.io/v3/${process.env.INFURA_ID}`})},
      network_id:3,
      from: '0x262c0A5B09Af5168710F2a4BCf33c35aA3E52c88'
    },
    kovan: {
      provider: function () {
        return new HDWalletProvider({
          mnemonic: {phrase: `${process.env.MNEMONIC}`},
          providerOrUrl: `https://kovan.infura.io/v3/${process.env.INFURA_ID}`
        })
      },
      network_id: 42,
      from: '0x262c0A5B09Af5168710F2a4BCf33c35aA3E52c88'
    }
  }
};

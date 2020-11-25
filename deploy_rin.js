const fs = require("fs");
const Web3 = require("web3");
const mnemonic = "heart snap wheat fine expose stomach grunt produce catch circle stamp pumpkin"
const truffleURL = "https://rinkeby.infura.io/v3/873fe33a8f5b46d2819dbfbed46d180d"
const HDWalletProvider = require("truffle-hdwallet-provider");
const provider = new HDWalletProvider(mnemonic, truffleURL)
const web3 = new Web3(provider);
const bytecode = fs.readFileSync('./build/__contracts_campaign_sol_CampaignFactory.bin');
const abi = JSON.parse(fs.readFileSync('./build/__contracts_campaign_sol_CampaignFactory.abi'));
const deploy = async() => {
    accounts = await web3.eth.getAccounts()
    console.log("Trying to deploy from accounts ", accounts[0]);
    factory = await
        new web3.eth.Contract(abi)
            .deploy({
                data: '0x' + bytecode,
            }).send({
                from: accounts[0],
                gas: '1000000'
            });
    console.log('contract deployed to',factory.options.address);    
};
deploy();
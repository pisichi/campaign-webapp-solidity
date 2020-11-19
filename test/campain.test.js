const assert = require("assert");
const ganache = require("ganache-cli");
const fs = require("fs");
const Web3 = require("web3");
const web3 = new Web3(ganache.provider());
const bytecode = fs.readFileSync('./build/__contracts_campain_sol_CampaignFactory.bin');
const abi = JSON.parse(fs.readFileSync('./build/__contracts_campain_sol_CampaignFactory.abi'));


var accounts;
var campaignFactory;

beforeEach(async () => {
    accounts = await web3.eth.getAccounts()
    campaignFactory = await
        new web3.eth.Contract(abi)
            .deploy({
                data: '0x' + bytecode,
            }).send({
                from: accounts[0],
                gas: '1000000'
            });
});

describe('campaignFactory', () => {
    it('deploys a campaignFactory contract', () => {
        assert.ok(campaignFactory.options.address);
    });

    it('create campaign', async () => {
        await campaignFactory.methods.createCampaign(10000).send({
            from: accounts[0],
            gas: "4000000"
        });
        const deployedCampaigns = await campaignFactory.methods.getDeployedCampaigns().call({
            from: accounts[0]
        });
        assert.strictEqual(1, deployedCampaigns.length);
    });

    it('create multiple campaigns', async () => {
        await campaignFactory.methods.createCampaign(10000).send({
            from: accounts[0],
            gas: "4000000"
        });
        await campaignFactory.methods.createCampaign(10000).send({
            from: accounts[1],
            gas: "4000000"
        });
        await campaignFactory.methods.createCampaign(10000).send({
            from: accounts[2],
            gas: "4000000"
        });
        await campaignFactory.methods.createCampaign(10000).send({
            from: accounts[3],
            gas: "4000000"
        });
        const deployedCampaigns = await campaignFactory.methods.getDeployedCampaigns().call({
            from: accounts[4]
        });
        assert.strictEqual(4, deployedCampaigns.length);
    });

    it('contribute', () => {
        await campaignFactory.methods.createCampaign(10000).send({
            from: accounts[0],
            gas: "4000000"
        });
        const deployedCampaigns = await campaignFactory.methods.getDeployedCampaigns().call({
            from: accounts[0]
        });
        assert.strictEqual(1, deployedCampaigns.length);
    });


    //createRequest

    //only manager can createRequest

    //approveRequest

    //finalizeRequest
});


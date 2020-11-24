const assert = require("assert");
const ganache = require("ganache-cli");
const fs = require("fs");
const Web3 = require("web3");
const web3 = new Web3(ganache.provider());
const bytecode = fs.readFileSync(
  "./build/__contracts_campain_sol_CampaignFactory.bin"
);
const abi = JSON.parse(
  fs.readFileSync("./build/__contracts_campain_sol_CampaignFactory.abi")
);

const abi2 = JSON.parse(
  fs.readFileSync("./build/__contracts_campain_sol_Campaign.abi")
);

var accounts;
var campaignFactory;
var campaign;

beforeEach(async () => {
  accounts = await web3.eth.getAccounts();
  campaignFactory = await new web3.eth.Contract(abi)
    .deploy({
      data: "0x" + bytecode,
    })
    .send({
      from: accounts[0],
      gas: "1000000",
    });
});

describe("campaignFactory", () => {

  it("deploys a campaignFactory contract", () => {
    assert.ok(campaignFactory.options.address);
  });

  it("create campaign", async () => {
    await campaignFactory.methods.createCampaign(100000).send({
      from: accounts[0],
      gas: "4000000",
    });
    const deployedCampaigns = await campaignFactory.methods
      .getDeployedCampaigns()
      .call({
        from: accounts[0],
      });
    let campaignAddress = deployedCampaigns[0];
    campaign = await new web3.eth.Contract(abi2, campaignAddress);
    assert.strictEqual(1, deployedCampaigns.length);
  });

  it("deploys a campaign contract", () => {
    assert.ok(campaign.options.address);
  });

  it("check manager", async () => {
    const managerAddress = await campaign.methods.manager().call({
      from: accounts[0],
    });
    assert.strictEqual(accounts[0], managerAddress);
  });

  it("contribute require minimum amount", async () => {
    var pass = "ok";
    try {
      await campaign.methods.contribute().send({
        from: accounts[1],
        value: 1,
        gas: "4000000",
      });
    } catch (err) {
      pass = "not ok";
    }
    assert.strictEqual("not ok", pass);
  });

  it("contribute", async () => {
    await campaign.methods.contribute().send({
      from: accounts[1],
      value: web3.utils.toWei("0.01", "ether"),
      gas: "4000000",
    });

    const approve = await campaign.methods.approvers(accounts[1]).call({
      from: accounts[1],
    });

    assert.strictEqual(true, approve);
  });

  it("only manager can create request", async () => {
    var pass = "ok";
    try {
      await campaign.methods.createRequest("test", 1000, accounts[0]).send({
        from: accounts[1],
        gas: "4000000",
      });
    } catch (err) {
      pass = "not ok";
    }
    assert.strictEqual("not ok", pass);
  });

  it("create request", async () => {
    await campaign.methods.createRequest("test", 1000, accounts[0]).send({
      from: accounts[0],
      gas: "4000000",
    });

    const request = await campaign.methods.requests(0).call({
      from: accounts[0],
    });
    assert.strictEqual("test", request.description);
  });

  it("only contributor can approve", async () => {
    var pass = "ok";
    try {
      await campaign.methods.approveRequest(0).send({
        from: accounts[2],
        gas: "4000000",
      });
    } catch (err) {
      pass = "not ok";
    }
    assert.strictEqual("not ok", pass);
  });

  it("approve", async () => {
    await campaign.methods.approveRequest(0).send({
      from: accounts[1],
      gas: "4000000",
    });
    const request = await campaign.methods.requests(0).call({
      from: accounts[1],
    });
    assert.strictEqual("1", request.approvalCount);
  });

  it("only manager can finalize", async () => {
    var pass = "ok";
    try {
      await campaign.methods.finalizeRequest(0).send({
        from: accounts[1],
        gas: "4000000",
      });
    } catch (err) {
      pass = "not ok";
    }
    assert.strictEqual("not ok", pass);
  });

  it("finalize request", async () => {
    // await campaign.methods.contribute().send({
    //   from: accounts[2],
    //   value: web3.utils.toWei("0.01", "ether"),
    //   gas: "4000000",
    // });
    // await campaign.methods.approveRequest(0).send({
    //   from: accounts[2],
    //   gas: "4000000",
    // });
    // const approve = await campaign.methods.approvers(accounts[2]).call({
    //   from: accounts[2],
    // });
    await campaign.methods.finalizeRequest(0).send({
      from: accounts[0],
      gas: "4000000",
    });
    const request = await campaign.methods.requests(0).call({
      from: accounts[0],
    });

    // assert.strictEqual(true, approve);
    // assert.strictEqual("2", request.approvalCount);
    assert.strictEqual(true, request.complete);
  });

  // it("create multiple campaigns", async () => {
  //   await campaignFactory.methods.createCampaign(10000).send({
  //     from: accounts[0],
  //     gas: "4000000",
  //   });
  //   await campaignFactory.methods.createCampaign(10000).send({
  //     from: accounts[1],
  //     gas: "4000000",
  //   });
  //   await campaignFactory.methods.createCampaign(10000).send({
  //     from: accounts[2],
  //     gas: "4000000",
  //   });
  //   await campaignFactory.methods.createCampaign(10000).send({
  //     from: accounts[3],
  //     gas: "4000000",
  //   });
  //   const deployedCampaigns = await campaignFactory.methods
  //     .getDeployedCampaigns()
  //     .call({
  //       from: accounts[4],
  //     });
  //   assert.strictEqual(4, deployedCampaigns.length);
  // });


});


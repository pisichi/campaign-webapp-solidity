const assert = require("assert");
const ganache = require("ganache-cli");
const fs = require("fs");
const Web3 = require("web3");
const web3 = new Web3(ganache.provider());
const bytecode = fs.readFileSync('./build/__contracts_lottery_sol_Lottery.bin');
const abi = JSON.parse(fs.readFileSync('./build/__contracts_lottery_sol_Lottery.abi'));
var accounts;
var lottery;

beforeEach(async () => {
    accounts = await web3.eth.getAccounts()
    lottery = await
        new web3.eth.Contract(abi)
            .deploy({
                data: '0x' + bytecode,
            }).send({
                from: accounts[0],
                gas: '1000000'
            });
});
describe('lottery', () => {
    it('deploys a lottery contract', () => {
        assert.ok(lottery.options.address);
    });
    
    it('test one account to enter ', async () => {
        await lottery.methods.enter().send({
            from: accounts[0],
            value: web3.utils.toWei("0.01", "ether")
        });
        const players = await lottery.methods.getPlayers().call({
            from: accounts[0]
        });
        assert.strictEqual(accounts[0], players[0]);
        assert.strictEqual(1, players.length);
    });

    it('test multiple account to enter ', async () => {
        await lottery.methods.enter().send({
            from: accounts[0],
            value: web3.utils.toWei("0.01", "ether")
        });
        await lottery.methods.enter().send({
            from: accounts[1],
            value: web3.utils.toWei("0.01", "ether")
        });
        await lottery.methods.enter().send({
            from: accounts[2],
            value: web3.utils.toWei("0.01", "ether")
        });
        const players = await lottery.methods.getPlayers().call({
            from: accounts[0]
        });
        assert.strictEqual(accounts[0], players[0]);
        assert.strictEqual(accounts[1], players[1]);
        assert.strictEqual(accounts[2], players[2]);
        assert.strictEqual(3, players.length);
    });

    it('requires minimum amount of ether to enter', async () => {
        var pass = "ok"
        try {
            await lottery.methods.enter().send({
                from: accounts[0],
                value: web3.utils.toWei("0", "ether")
            });

        } catch (err) {
            pass = "not ok";

        }
        assert.strictEqual("not ok", pass);
    });

    it('only manager can call pickWiner', async () => {
        var pass = "ok";
        try {
            await lottery.methods.enter().send({
                from: accounts[0],
                value: web3.utils.toWei("0.01", "ether")
            });
            await lottery.methods.pickWinner().send({
                from: accounts[1]
            });
        }
        catch (err) {
            pass = "not ok";
        }
        assert.strictEqual("not ok", pass);
    });

    it ('sends money to the winner and resets the players array', async() => {
        await lottery.methods.enter().send({
            from: accounts[0],
            value: web3.utils.toWei("2", "ether")
        });
        const initialBalance = await web3.eth.getBalance(accounts[0]);
        console.log('initialBalance = ' + web3.utils.fromWei(initialBalance, "ether"))
        await lottery.methods.pickWinner().send({
            from: accounts[0]
        });    
        //check correct winner
        winner = await lottery.methods.winner().call()
        assert.strictEqual(accounts[0], winner)
        const finalBalance = await web3.eth.getBalance(accounts[0]);
        console.log('finalBalance = ' + web3.utils.fromWei(finalBalance, "ether"))
        //check that the winner got money
        const difference = finalBalance - initialBalance;
        console.log(web3.utils.fromWei('0'+difference, "ether"));
        assert(difference > web3.utils.toWei("1.8", "ether"));
        //check that the number of players is 0
        const players =await lottery.methods.getPlayers().call({
            from: accounts[0]
        });
        assert.strictEqual(0, players.length);
        //check that the contract balance is 0
        const lotteryBalance = await web3.eth.getBalance(lottery.options.address);
        assert.strictEqual('0', lotteryBalance);
    });

});


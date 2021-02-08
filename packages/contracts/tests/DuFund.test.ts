const { accounts, contract } = require('@openzeppelin/test-environment');
const { BN, expectRevert } = require('@openzeppelin/test-helpers');
const { convertTimeToSeconds } =require("../utils/utils");
const DuFund = contract.fromArtifact('DuFund');
const DuFundToken = contract.fromArtifact('DuFundToken');

let duFundTokenInstance: any;
let duFundInstance: any;


const yesterdayExpiryDate = new Date();
yesterdayExpiryDate.setDate(yesterdayExpiryDate.getDate() - 1);

const tomorrowExpiryDate = new Date();
tomorrowExpiryDate.setDate(tomorrowExpiryDate.getDate() + 1);

describe('DuFund Contract', () => {
  const [Deployer, Guy, Gal] = accounts;

  beforeEach(async () => {
    duFundTokenInstance = await DuFundToken.new({ from: Deployer });
    duFundInstance = await DuFund.new(duFundTokenInstance.address, { from: Deployer });
  });

  describe('DuFund', () => {
    describe('basic contract test', () => {
      it('should set correct symbol ', async () => {
        const symbol = await duFundInstance.symbol();
        expect(symbol).toBe("DFN");
      });
      it('should set correct tokenID initially ', async () => {
        const tokenID = await duFundInstance.getTokenID({ from: Deployer });
        expect(new BN(tokenID).toString()).toBe("1");
      });
    });
    describe('creating a new CF', () => {
      it('should mint a new token and increase tokenID', async () => {
        await duFundInstance.createCF('/link', 1, Date.now(), 200, { from: Guy });
        const guyBalance = await duFundInstance.balanceOf(Guy, { from: Guy });
        const tokenID = await duFundInstance.getTokenID({ from: Guy });
        const tokenURI = await duFundInstance.tokenURI(1, { from: Guy });
        expect(new BN(guyBalance).toString()).toBe("1");
        expect(new BN(tokenID).toString()).toBe("2");
        expect(tokenURI).toBe("/link");
      });
      it('should mint a new token and set mappings', async () => {
        const expiryDate = Date.now();
        await duFundInstance.createCF('/link', 1, expiryDate, 200, { from: Guy });
        const cf = await duFundInstance.getCF(1);

        expect(new BN(cf.target).toString()).toBe('1');
        expect(new BN(cf.expiryDate).toNumber()).toBe(expiryDate);
        expect(new BN(cf.gweiPerToken).toNumber()).toBe(200);
        expect(cf.isCancelled).toBe(false);
      });
      it('should not be able to retreive non-existing CF', async () => {
        await expectRevert(duFundInstance.getCF(2), "cannot find CF");
      });
    });
    describe('fund a CF', () => {
      it('should revert for non-existing tokens', async () => {
        await expectRevert(duFundInstance.donate(2), "token does not exists");
      });
      it.skip('should revert for cancelled token', async () => {
        await duFundInstance.createCF('/link', 1, Date.now(), 200, { from: Guy });
        // cancel 1
        await expectRevert(duFundInstance.donate(1), "CF is cancelled");
      });
      it('should increase FC\'s balance', async () => {
        await duFundInstance.createCF('/link', 1, convertTimeToSeconds(tomorrowExpiryDate), 200, { from: Guy });
        await duFundInstance.donate(1, { value: 200, from: Gal });
        const balance = await duFundInstance.getBalance(1);
        expect(new BN(balance).toNumber()).toBe(200);
      });
      it('should mint 2 token', async () => {
        console.log(convertTimeToSeconds(tomorrowExpiryDate), Date.now()/1000);
        
        await duFundInstance.createCF('/link', 1, convertTimeToSeconds(tomorrowExpiryDate), 200, { from: Guy });
        await duFundInstance.donate(1, { value: 400, from: Gal });
        const balance = await duFundInstance.getTokenAmount(1, {from: Gal});
        expect(new BN(balance).toNumber()).toBe(2);
        await expectRevert(duFundInstance.donate(2, {value: 200, from: Gal}), 'token does not exist');
      });
      it('should not mint since CF has not reached the target', async () => {
        await duFundInstance.createCF('/link', 1, convertTimeToSeconds(yesterdayExpiryDate) , 200, { from: Guy });
        await expectRevert(duFundInstance.donate(1, {value: 200, from: Gal}), 'CF is expired');
      });
    });
  });
});

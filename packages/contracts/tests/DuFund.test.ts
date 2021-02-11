const { accounts, contract } = require('@openzeppelin/test-environment');
const { BN, expectRevert, balance } = require('@openzeppelin/test-helpers');
const { convertTimeToSeconds } = require("../utils/utils");
const DuFund = contract.fromArtifact('DuFund');
const DuFundToken = contract.fromArtifact('DuFundToken');

let duFundTokenInstance: any;
let duFundInstance: any;


const yesterdayExpiryDate = new Date();
yesterdayExpiryDate.setDate(yesterdayExpiryDate.getDate() - 1);

const tomorrowExpiryDate = new Date();
tomorrowExpiryDate.setDate(tomorrowExpiryDate.getDate() + 1);

const now = () => Math.floor(Date.now() / 1000);

const GAS_PRICE = 20000000000;

describe('DuFund Contract', () => {
  const [Deployer, Guy, Gal, Pete] = accounts;

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
    describe('cancelling/closing a CF', () => {
      it('should cancel a CF', async () => {
        await duFundInstance.createCF('/link', 1000, now(), 200, { from: Guy });
        await duFundInstance.cancelCF(1, { from: Guy });
        const cf = await duFundInstance.getCF(1);
        expect(cf.isCancelled).toBe(true);
      });
      it('should close a CF', async () => {
        await duFundInstance.createCF('/link', 1000, now(), 200, { from: Guy });
        await duFundInstance.donate(1, { from: Gal, value: 1500 });
        await duFundInstance.closeCF(1, { from: Guy });
        const cf = await duFundInstance.getCF(1);
        expect(cf.isClosed).toBe(true);
      });
      it('should  revert cancel a CF if not the creator', async () => {
        await duFundInstance.createCF('/link', 1000, now(), 200, { from: Guy });
        await expectRevert(duFundInstance.cancelCF(1, { from: Gal }), "only creator can execute");
      });
      it('should  revert close a CF if not the creator', async () => {
        await duFundInstance.createCF('/link', 1000, now(), 200, { from: Guy });
        await expectRevert(duFundInstance.closeCF(1, { from: Gal }), "only creator can execute");
      });
      it('should  revert close a CF if target not reached', async () => {
        await duFundInstance.createCF('/link', 1000, now(), 200, { from: Guy });
        await expectRevert(duFundInstance.closeCF(1, { from: Guy }), "target is not reached");
      });
    });
    describe('fund a CF', () => {
      it('should revert for non-existing tokens', async () => {
        await expectRevert(duFundInstance.donate(2), "token does not exists");
      });
      it.skip('should revert for cancelled token', async () => {
        await duFundInstance.createCF('/link', 1, now(), 200, { from: Guy });
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
        await duFundInstance.createCF('/link', 1, convertTimeToSeconds(tomorrowExpiryDate), 200, { from: Guy });
        await duFundInstance.donate(1, { value: 400, from: Gal });
        const balance = await duFundInstance.getTokenAmount(1, { from: Gal });
        expect(new BN(balance).toNumber()).toBe(2);
        await expectRevert(duFundInstance.donate(2, { value: 200, from: Gal }), 'token does not exist');
      });
      it('should not mint since CF has not reached the target', async () => {
        await duFundInstance.createCF('/link', 1, convertTimeToSeconds(yesterdayExpiryDate), 200, { from: Guy });
        await expectRevert(duFundInstance.donate(1, { value: 200, from: Gal }), 'CF is expired');
      });
      it('should fail if isClosed', async () => {
        await duFundInstance.createCF('/link', 200, convertTimeToSeconds(tomorrowExpiryDate), 200, { from: Guy });
        await duFundInstance.donate(1, { value: 400, from: Gal });
        await duFundInstance.closeCF(1, { from: Guy });
        await expectRevert(duFundInstance.donate(1, { from: Pete }), "CF is cancelled or closed");
      });
      it('should fail if isCancelled', async () => {
        await duFundInstance.createCF('/link', 200, convertTimeToSeconds(tomorrowExpiryDate), 200, { from: Guy });
        await duFundInstance.donate(1, { value: 400, from: Gal });
        await duFundInstance.cancelCF(1, { from: Guy });
        await expectRevert(duFundInstance.donate(1, { from: Pete }), "CF is cancelled or closed");
      });
    });
    describe('withdraw money from donator', () => {
      beforeEach(async () => {
        const twoSecondsIntoTheFuture = now() + 2;

        await duFundInstance.createCF('/link', 400, twoSecondsIntoTheFuture, 200, { from: Guy });
      });
      it('fund and withdraw should work', async (done) => {
        const tracker = await balance.tracker(Gal, 'wei');
        await duFundInstance.donate(1, { value: 200, from: Gal });
        const balanceAfterDonation = await tracker.get();
        const CFBalanceAfterDonation = await duFundInstance.getRaisedMoeny(1);

        setTimeout(async () => {
          const withdrawReceipt = await duFundInstance.withdrawDonatorPayments(Gal, 1, { from: Gal });

          const balanceAfterWithdraw = await tracker.get();
          const balanceUsed = new BN(withdrawReceipt.receipt.gasUsed);
          const expected = balanceAfterDonation.sub(balanceUsed.mul(new BN(GAS_PRICE))).add(new BN(200));
          const CFBalanceAfterWithdraw = await duFundInstance.getRaisedMoeny(1);

          expect(CFBalanceAfterWithdraw.add(new BN(200)).toString()).toStrictEqual(CFBalanceAfterDonation.toString());
          expect(balanceAfterWithdraw).toStrictEqual(expected);
          done();
        }, 3000);
      });
      it('should fail if token is not expired', async () => {
        await expectRevert(duFundInstance.withdrawDonatorPayments(Gal, 1, { from: Gal }), 'CF is still going');
      });
      it('should fail if CF is reached the target', async (done) => {
        await duFundInstance.donate(1, { value: 1000, from: Gal });
        setTimeout(async () => {
          await expectRevert(duFundInstance.withdrawDonatorPayments(Gal, 1, { from: Gal }), 'CF is still going');
          done();
        }, 3000);
      });
      it('should burn tokens if withdraw money', async (done) => {
        await duFundInstance.donate(1, { value: 200, from: Gal });
        const tokensBeforeWithdraw = await duFundInstance.getTokenAmount(1, { from: Gal });
        expect(tokensBeforeWithdraw.toString()).toBe('1');
        setTimeout(async () => {
          await duFundInstance.withdrawDonatorPayments(Gal, 1, { from: Gal });
          const tokensAfterWithdraw = await duFundInstance.getTokenAmount(1, { from: Gal });
          expect(tokensAfterWithdraw.toString()).toBe('0');
          done();
        }, 3000);
      });
      it('should fail if token is not found', async () => {
        await expectRevert(duFundInstance.withdrawDonatorPayments(Gal, 2, { from: Gal }), 'token does not exists');
      });
      it.skip('should fail if the CF isClosed', async () => {
        // TODO: implement after isClosed
      });
      it.skip('should withdraw money if isCancelled', async () => {
        // TODO: implement after isClosed
      });
      it('should fail if sender is not the recepient', async (done) => {
        await duFundInstance.donate(1, { value: 200, from: Gal });
        await duFundInstance.donate(1, { value: 200, from: Guy });
        setTimeout(async () => {
          await expectRevert(duFundInstance.withdrawDonatorPayments(Gal, 1, { from: Guy }), 'not the same as sender');
          await expectRevert(duFundInstance.withdrawDonatorPayments(Guy, 1, { from: Gal }), 'not the same as sender');
          done();
        }, 3000);
      });
      it('should not add any balance if not donated before', async (done) => {
        const tracker = await balance.tracker(Guy, 'wei');
        await duFundInstance.donate(1, { value: 200, from: Gal });
        const balanceAfterDonation = await tracker.get();
        setTimeout(async () => {
          const withdrawReceipt = await duFundInstance.withdrawDonatorPayments(Guy, 1, { from: Guy });

          const balanceAfterWithdraw = await tracker.get();
          const balanceUsed = new BN(withdrawReceipt.receipt.gasUsed);
          const expected = balanceAfterDonation.sub(balanceUsed.mul(new BN(GAS_PRICE)));

          expect(balanceAfterWithdraw).toStrictEqual(expected);
          done();
        }, 3000);
      });
    });

    describe('withdraw money by creator', () => {
      beforeEach(async () => {
        const twoSecondsIntoTheFuture = now() + 2;

        await duFundInstance.createCF('/link', 1000, twoSecondsIntoTheFuture, 200, { from: Guy });
      });
      it('withdraw by creator should work', async () => {
        const tracker = await balance.tracker(Guy, 'wei');
        await duFundInstance.donate(1, { value: 1000, from: Gal });
        await duFundInstance.donate(1, { value: 500, from: Pete });
        await duFundInstance.closeCF(1, { from: Guy });
        const balanceBeforeWithdraw = await tracker.get();
        const withdrawReceipt = await duFundInstance.withdrawCreatorPayments(Guy, 1, { from: Guy });
        const balanceUsed = new BN(withdrawReceipt.receipt.gasUsed);
        const balanceAfterWithdraw = await tracker.get();
        const expected = balanceBeforeWithdraw.sub(balanceUsed.mul(new BN(GAS_PRICE))).add(new BN(1500));
        
        expect(balanceAfterWithdraw).toStrictEqual(expected);
      });
      it('should fail to withdraw by creator if CF is not closed', async () => {
        await duFundInstance.donate(1, { value: 2500, from: Pete });
        await expectRevert(duFundInstance.withdrawCreatorPayments(Guy, 1, { from: Guy }),"CF is not closed");
      });
      it('should fail to withdraw if not the creator', async () => {
        await duFundInstance.donate(1, { value: 2500, from: Pete });
        await duFundInstance.closeCF(1, { from: Guy });

        await expectRevert(duFundInstance.withdrawCreatorPayments(Gal, 1, { from: Guy }),"only creator can execute");
        await expectRevert(duFundInstance.withdrawCreatorPayments(Guy, 1, { from: Gal }),"only creator can execute");
        await expectRevert(duFundInstance.withdrawCreatorPayments(Pete, 1, { from: Gal }),"only creator can execute");
      });
    });
  });
});

export { };

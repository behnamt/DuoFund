const { accounts, contract } = require('@openzeppelin/test-environment');
const { BN, expectRevert } = require('@openzeppelin/test-helpers');
const DuFundToken = contract.fromArtifact('DuFundToken');

let duFundTokenIns: any;

describe('DuFund Contract', () => {
  const [Deployer, Guy, Gal] = accounts;

  beforeEach(async () => {
    duFundTokenIns = await DuFundToken.new({ from: Deployer });
  });

  describe('DuFundToken', () => {
    describe('mint', () => {
      it('should mint token ', async () => {
        await duFundTokenIns.mint(Guy, 2, { from: Deployer });
        const balance = await duFundTokenIns.balanceOf(Guy);
        
        expect(new BN(balance).toNumber()).toBe(2);
      });
    });
  });
});

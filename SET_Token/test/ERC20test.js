const shouldFail = require('./utils/ShouldFail');
const expectEvent = require('./utils/expectEvent');
const { ZERO_ADDRESS } = require('./utils/constants');

var SETToken = artifacts.require('./SET.sol')

const BigNumber = web3.BigNumber;

require('chai')
  .use(require('chai-bignumber')(BigNumber))
  .should();

contract('SETToken', function ([_, owner, recipient, anotherAccount]) {
  beforeEach(async function () {
    this.token = await SETToken.new(owner, 0);
    await this.token.mint(owner,100)
  });

  describe('total supply', function () {
    it('returns the total amount of tokens', async function () {
      (await this.token.totalSupply()).should.be.bignumber.equal(100);
    });
  });

  describe('balanceOf', function () {
    describe('when the requested account has no tokens', function () {
      it('returns zero', async function () {
        (await this.token.balanceOf(anotherAccount)).should.be.bignumber.equal(0);
      });
    });

    describe('when the requested account has some tokens', function () {
      it('returns the total amount of tokens', async function () {
        (await this.token.balanceOf(owner)).should.be.bignumber.equal(100);
      });
    });
  });

  describe('transfer', function () {
    describe('when the recipient is not the zero address', function () {
      const to = recipient;

      describe('when the sender does not have enough balance', function () {
        const amount = 101;

        it('reverts', async function () {
          await shouldFail.reverting(this.token.transfer(to, amount, { from: owner }));
        });
      });

      describe('when the sender has enough balance', function () {
        const amount = 100;

        it('transfers the requested amount', async function () {
          await this.token.transfer(to, amount, { from: owner });

          (await this.token.balanceOf(owner)).should.be.bignumber.equal(0);

          (await this.token.balanceOf(to)).should.be.bignumber.equal(amount);
        });

        it('emits a transfer event', async function () {
          const { logs } = await this.token.transfer(to, amount, { from: owner });

          expectEvent.inLogs(logs, 'Transfer', {
            from: owner,
            to: to,
            value: amount,
          });
        });
      });
    });

    describe('when the recipient is the zero address', function () {
      const to = ZERO_ADDRESS;

      it('reverts', async function () {
        await shouldFail.reverting(this.token.transfer(to, 100, { from: owner }));
      });
    });
  });

  describe('approve', function () {
    describe('when the spender is not the zero address', function () {
      const spender = recipient;

      describe('when the sender has enough balance', function () {
        const amount = 100;

        it('emits an approval event', async function () {
          const { logs } = await this.token.approve(spender, amount, { from: owner });

          expectEvent.inLogs(logs, 'Approval', {
            owner: owner,
            spender: spender,
            value: amount,
          });
        });

        describe('when there was no approved amount before', function () {
          it('approves the requested amount', async function () {
            await this.token.approve(spender, amount, { from: owner });

            (await this.token.allowance(owner, spender)).should.be.bignumber.equal(amount);
          });
        });

        describe('when the spender had an approved amount', function () {
          beforeEach(async function () {
            await this.token.approve(spender, 1, { from: owner });
          });

          it('approves the requested amount and replaces the previous one', async function () {
            await this.token.approve(spender, amount, { from: owner });

            (await this.token.allowance(owner, spender)).should.be.bignumber.equal(amount);
          });
        });
      });

      describe('when the sender does not have enough balance', function () {
        const amount = 101;

        it('emits an approval event', async function () {
          const { logs } = await this.token.approve(spender, amount, { from: owner });

          expectEvent.inLogs(logs, 'Approval', {
            owner: owner,
            spender: spender,
            value: amount,
          });
        });

        describe('when there was no approved amount before', function () {
          it('approves the requested amount', async function () {
            await this.token.approve(spender, amount, { from: owner });

            (await this.token.allowance(owner, spender)).should.be.bignumber.equal(amount);
          });
        });

        describe('when the spender had an approved amount', function () {
          beforeEach(async function () {
            await this.token.approve(spender, 1, { from: owner });
          });

          it('approves the requested amount and replaces the previous one', async function () {
            await this.token.approve(spender, amount, { from: owner });

            (await this.token.allowance(owner, spender)).should.be.bignumber.equal(amount);
          });
        });
      });
    });

    describe('when the spender is the zero address', function () {
      const amount = 100;
      const spender = ZERO_ADDRESS;

      it('reverts', async function () {
        await shouldFail.reverting(this.token.approve(spender, amount, { from: owner }));
      });
    });
  });

  describe('transfer from', function () {
    const spender = recipient;

    describe('when the recipient is not the zero address', function () {
      const to = anotherAccount;

      describe('when the spender has enough approved balance', function () {
        beforeEach(async function () {
          await this.token.approve(spender, 100, { from: owner });
        });

        describe('when the owner has enough balance', function () {
          const amount = 100;

          it('transfers the requested amount', async function () {
            await this.token.transferFrom(owner, to, amount, { from: spender });

            (await this.token.balanceOf(owner)).should.be.bignumber.equal(0);

            (await this.token.balanceOf(to)).should.be.bignumber.equal(amount);
          });

          it('decreases the spender allowance', async function () {
            await this.token.transferFrom(owner, to, amount, { from: spender });

            (await this.token.allowance(owner, spender)).should.be.bignumber.equal(0);
          });

          it('emits a transfer event', async function () {
            const { logs } = await this.token.transferFrom(owner, to, amount, { from: spender });

            expectEvent.inLogs(logs, 'Transfer', {
              from: owner,
              to: to,
              value: amount,
            });
          });
        });

        describe('when the owner does not have enough balance', function () {
          const amount = 101;

          it('reverts', async function () {
            await shouldFail.reverting(this.token.transferFrom(owner, to, amount, { from: spender }));
          });
        });
      });

      describe('when the spender does not have enough approved balance', function () {
        beforeEach(async function () {
          await this.token.approve(spender, 99, { from: owner });
        });

        describe('when the owner has enough balance', function () {
          const amount = 100;

          it('reverts', async function () {
            await shouldFail.reverting(this.token.transferFrom(owner, to, amount, { from: spender }));
          });
        });

        describe('when the owner does not have enough balance', function () {
          const amount = 101;

          it('reverts', async function () {
            await shouldFail.reverting(this.token.transferFrom(owner, to, amount, { from: spender }));
          });
        });
      });
    });

    describe('when the recipient is the zero address', function () {
      const amount = 100;
      const to = ZERO_ADDRESS;

      beforeEach(async function () {
        await this.token.approve(spender, amount, { from: owner });
      });

      it('reverts', async function () {
        await shouldFail.reverting(this.token.transferFrom(owner, to, amount, { from: spender }));
      });
    });
  });

  describe('_mint', function () {
    const initialSupply = new BigNumber(100);
    const amount = new BigNumber(50);

    it('rejects a null account', async function () {
      await shouldFail.reverting(this.token.mint(ZERO_ADDRESS, amount));
    });

    describe('for a non null account', function () {
      beforeEach('minting', async function () {
        const { logs } = await this.token.mint(recipient, amount);
        this.logs = logs;
      });

      it('increments totalSupply', async function () {
        const expectedSupply = initialSupply.plus(amount);
        (await this.token.totalSupply()).should.be.bignumber.equal(expectedSupply);
      });

      it('increments recipient balance', async function () {
        (await this.token.balanceOf(recipient)).should.be.bignumber.equal(amount);
      });

      it('emits Transfer event', async function () {
        const event = expectEvent.inLogs(this.logs, 'Transfer', {
          from: ZERO_ADDRESS,
          to: recipient,
        });

        event.args.value.should.be.bignumber.equal(amount);
      });
    });
  });


  describe('_burnFrom', function () {
    const initialSupply = new BigNumber(100);
    const allowance = new BigNumber(70);

    const spender = anotherAccount;

    beforeEach('approving', async function () {
      await this.token.approve(spender, allowance, { from: owner });
    });

    it('rejects a null account', async function () {
      await shouldFail.reverting(this.token.burnFrom(ZERO_ADDRESS, 1));
    });

    describe('for a non null account', function () {

      it('rejects burning more than balance', async function () {
        await shouldFail.reverting(this.token.burnFrom(owner, initialSupply.plus(1)));
      });

      const describeBurnFrom = function (description, amount) {
        describe(description, function () {
          beforeEach('burning', async function () {
            const { logs } = await this.token.burnFrom(owner, amount, { from: spender });
            this.logs = logs;
          });

          it('decrements totalSupply', async function () {
            const expectedSupply = initialSupply.minus(amount);
            (await this.token.totalSupply()).should.be.bignumber.equal(expectedSupply);
          });

          it('decrements owner balance', async function () {
            const expectedBalance = initialSupply.minus(amount);
            (await this.token.balanceOf(owner)).should.be.bignumber.equal(expectedBalance);
          });

          it('decrements spender allowance', async function () {
            const expectedAllowance = allowance.minus(amount);
            (await this.token.allowance(owner, spender)).should.be.bignumber.equal(expectedAllowance);
          });

          it('emits Transfer event', async function () {
            const event = expectEvent.inLogs(this.logs, 'Transfer', {
              from: owner,
              to: ZERO_ADDRESS,
            });

            event.args.value.should.be.bignumber.equal(amount);
          });
        });
      };
    });
  });

  describe('pausable token', function () {
    const from = owner;
    const to = recipient;

    describe('transfer', function () {
      it('allows to transfer when unpaused', async function () {
        await this.token.transfer(to, 100, { from: owner });

        (await this.token.balanceOf(owner)).should.be.bignumber.equal(0);
        (await this.token.balanceOf(to)).should.be.bignumber.equal(100);
      });

      it('allows to transfer when paused and then unpaused', async function () {
        await this.token.pause();
        await this.token.unpause();

        await this.token.transfer(to, 100, { from: owner });

        (await this.token.balanceOf(owner)).should.be.bignumber.equal(0);
        (await this.token.balanceOf(to)).should.be.bignumber.equal(100);
      });

      it('reverts when trying to transfer when paused', async function () {
        await this.token.pause();

        await shouldFail.reverting(this.token.transfer(to, 100, { from: owner }));
      });
    });
  });
});

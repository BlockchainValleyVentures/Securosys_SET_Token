const { shouldBehaveLikeOwnable } = require('./utils/OwnableBehavior');

var SETToken = artifacts.require('./SET.sol')


contract('SETToken', function ([_, owner, ...otherAccounts]) {
  beforeEach(async function () {
    this.ownable = await SETToken.new({ from: owner });
  });

  shouldBehaveLikeOwnable(owner, otherAccounts);
});

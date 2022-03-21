const { expectRevert } = require('@openzeppelin/test-helpers');
const OnzeToken = artifacts.require('OnzeToken');

contract('OnzeToken', ([alice, bob, carol]) => {
    beforeEach(async () => {
        this.onze = await OnzeToken.new({ from: alice });
    });

    it('should have correct name and symbol and decimal', async () => {
        const name = await this.onze.name();
        const symbol = await this.onze.symbol();
        const decimals = await this.onze.decimals();
        assert.equal(name.valueOf(), 'OnzeToken');
        assert.equal(symbol.valueOf(), 'OX');
        assert.equal(decimals.valueOf(), '18');
    });

    it('should only allow owner to mint token', async () => {
        await this.onze.mint(alice, '100', { from: alice });
        await this.onze.mint(bob, '1000', { from: alice });
        await expectRevert(
            this.onze.mint(carol, '1000', { from: bob }),
            'Ownable: caller is not the owner',
        );
        const totalSupply = await this.onze.totalSupply();
        const aliceBal = await this.onze.balanceOf(alice);
        const bobBal = await this.onze.balanceOf(bob);
        const carolBal = await this.onze.balanceOf(carol);
        assert.equal(totalSupply.valueOf(), '1100');
        assert.equal(aliceBal.valueOf(), '100');
        assert.equal(bobBal.valueOf(), '1000');
        assert.equal(carolBal.valueOf(), '0');
    });

    it('should supply token transfers properly', async () => {
        await this.onze.mint(alice, '100', { from: alice });
        await this.onze.mint(bob, '1000', { from: alice });
        await this.onze.transfer(carol, '10', { from: alice });
        await this.onze.transfer(carol, '100', { from: bob });
        const totalSupply = await this.onze.totalSupply();
        const aliceBal = await this.onze.balanceOf(alice);
        const bobBal = await this.onze.balanceOf(bob);
        const carolBal = await this.onze.balanceOf(carol);
        assert.equal(totalSupply.valueOf(), '1100');
        assert.equal(aliceBal.valueOf(), '90');
        assert.equal(bobBal.valueOf(), '900');
        assert.equal(carolBal.valueOf(), '110');
    });

    it('should fail if you try to do bad transfers', async () => {
        await this.onze.mint(alice, '100', { from: alice });
        await expectRevert(
            this.onze.transfer(carol, '110', { from: alice }),
            'ERC20: transfer amount exceeds balance',
        );
        await expectRevert(
            this.onze.transfer(carol, '1', { from: bob }),
            'ERC20: transfer amount exceeds balance',
        );
    });
  });

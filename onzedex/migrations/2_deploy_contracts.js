const Factory = artifacts.require('uniswapv2/UniswapV2Factory.sol');
const Router = artifacts.require('uniswapv2/UniswapV2Router02.sol');
const WETH = artifacts.require('WETH.sol');
const MockERC20 = artifacts.require('MockERC20.sol');
const OnzeToken = artifacts.require('OnzeToken.sol') 
const JuiceMaker = artifacts.require('JuiceMaker.sol'); 
const OnzeBar = artifacts.require('OnzeBar.sol');
const OnzeMaker = artifacts.require('OnzeMaker.sol');
const Migrator = artifacts.require('Migrator.sol');

module.exports = async function(deployer, _network, addresses) {
  const [admin, _] = addresses;

  await deployer.deploy(WETH);
  const weth = await WETH.deployed();
  const tokenA = await MockERC20.new('Token A', 'TKA', web3.utils.toWei('1000'));
  const tokenB = await MockERC20.new('Token B', 'TKB', web3.utils.toWei('1000'));

  await deployer.deploy(Factory, admin);
  const factory = await Factory.deployed();
  await factory.createPair(weth.address, tokenA.address);
  await factory.createPair(weth.address, tokenB.address);
  await deployer.deploy(Router, factory.address, weth.address);
  const router = await Router.deployed();

  await deployer.deploy(OnzeToken);
  const onzeToken = await OnzeToken.deployed();

  await deployer.deploy(
    JuiceMaker,
    onzeToken.address,
    admin,
    web3.utils.toWei('100'),
    1,
    1
  );
  const juiceMaker = await JuiceMaker.deployed();
  await onzeToken.transferOwnership(juiceMaker.address);

  await deployer.deploy(OnzeBar, onzeToken.address);
  const onzeBar = await OnzeBar.deployed();

  await deployer.deploy(
    OnzeMaker,
    factory.address, 
    onzeBar.address, 
    onzeToken.address, 
    weth.address
  );
  const onzeMaker = await OnzeMaker.deployed();
  await factory.setFeeTo(onzeMaker.address);

  await deployer.deploy(
    Migrator,
    juiceMaker.address,
    '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f',
    factory.address,
    1
  );
};

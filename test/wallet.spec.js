const {expect} = require('@jest/globals');
const {accounts, contract, web3} = require('@openzeppelin/test-environment');
const {
  expectRevert
} = require('@openzeppelin/test-helpers');

const Wallet = contract.fromArtifact('Wallet');

const [owner, wallet1, wallet2, wallet3, wallet4] = accounts;

describe('Wallet', () => {
  let wallet;

  beforeEach(async () => {
    wallet = await Wallet.new([wallet1, wallet2, wallet3], 2);
    web3.eth.sendTransaction({from: owner, to: wallet.address, value: 10_000});
  });

  it('should have correct approvers and quorum', async () => {
    const [approvers, quorum] = await Promise.all([wallet.getApprovers(), wallet.quorum()]);

    expect(approvers).toHaveLength(3);
    expect(approvers).toEqual([wallet1, wallet2, wallet3]);
    expect(quorum.toString()).toBe('2');
  });

  it('should create a transfers', async () => {
    await wallet.createTransfer(5000, wallet4, {from: wallet1});
    const transfers = await wallet.getTransfers();

    expect(transfers).toHaveLength(1);

    const firstTransfer = transfers[0];

    expect(firstTransfer[0]).toBe('0');
    expect(firstTransfer[1]).toBe('5000');
    expect(firstTransfer[2]).toBe(wallet4);
    expect(firstTransfer[3]).toBe('0');
    expect(firstTransfer[4]).toBeFalsy();
  });

  it('should not create transfers if sender is not approved', async () => {
    await expectRevert(wallet.createTransfer(5000, wallet4, {from: owner}), 'only approvers are allowed');
  });

  it('should increment approval', async () => {
    await wallet.createTransfer(1000, wallet4, {from: wallet1});
    await wallet.approveTransfer(0, {from: wallet1});
    const transfers = await wallet.getTransfers();

    const firstTransfer = transfers[0];

    const balance = await web3.eth.getBalance(wallet.address);

    expect(balance).toBe('10000');
    expect(firstTransfer[0]).toBe('0');
    expect(firstTransfer[1]).toBe('1000');
    expect(firstTransfer[2]).toBe(wallet4);
    expect(firstTransfer[3]).toBe('1');
    expect(firstTransfer[4]).toBeFalsy();
  });

  it('should sent transfer if quorum is reached', async () => {
    const balanceBefore = web3.utils.toBN(await web3.eth.getBalance(wallet4));
    await wallet.createTransfer(5000, wallet4, {from: wallet1});
    await wallet.approveTransfer(0, {from: wallet1});
    await wallet.approveTransfer(0, {from: wallet2});
    const balanceAfter = web3.utils.toBN(await web3.eth.getBalance(wallet4));

    expect(balanceAfter.sub(balanceBefore).toNumber()).toBe(5000);
  });

  it('should not approve transfer is sender is not approved', async () => {
    await wallet.createTransfer(1000, wallet4, {from: wallet1});
    await expectRevert(wallet.approveTransfer(0, {from: owner}), 'only approvers are allowed');
  });

  it('should not approve transfer if transfer is already sent', async () => {
    await wallet.createTransfer(5000, wallet4, {from: wallet1});
    await wallet.approveTransfer(0, {from: wallet1});
    await wallet.approveTransfer(0, {from: wallet2});
    await expectRevert(wallet.approveTransfer(0, {from: wallet3}), 'transfer has already been sent');
  });

  it('should not approve transfer twice', async () => {
    await wallet.createTransfer(5000, wallet4, {from: wallet1});
    await wallet.approveTransfer(0, {from: wallet1});
    await expectRevert(wallet.approveTransfer(0, {from: wallet1}), 'cannot approve a transfer that has already been approved');
  });
});

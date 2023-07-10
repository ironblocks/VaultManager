import { expect } from 'chai';
import { Signer } from 'ethers';
import { ethers } from 'hardhat';
import { MockTrustee } from '../typechain-types';
import { VaultManager } from '../typechain-types/contracts/VaultManager';
import { ERC20Token } from '../typechain-types/poolz-helper-v2/contracts/token';

describe('Vault Manager Fail', function () {

  describe("OnlyGovernor Functions", function() {
    let vaultManager: VaultManager;
    let token: ERC20Token;
    let nonGovernor: Signer;

    beforeEach(async function () {
        const Token = await ethers.getContractFactory('ERC20Token');
        token = await Token.deploy("Token", "TKN");
        await token.deployed();
        
        const signers = await ethers.getSigners();
        nonGovernor = signers[1];

        const VaultManager = await ethers.getContractFactory('VaultManager');
        vaultManager = await VaultManager.deploy();
        await vaultManager.deployed();
    });

    it("should fail to create new vault if called by non-governor", async () => {{
        await expect(vaultManager.connect(nonGovernor).createNewVault(token.address))
            .to.be.revertedWith("Authorization Error");
    }})

    it("should fail to setTrustee if called by non-governor", async () => {
        const permittedAddress = await nonGovernor.getAddress();
        await expect(vaultManager.connect(nonGovernor).setTrustee(permittedAddress))
            .to.be.revertedWith("Authorization Error");
    })

    it("should fail to set active status if called by non owner", async () => {
        const vaultId = await vaultManager.callStatic.createNewVault(token.address);
        await vaultManager.createNewVault(token.address);

        await expect(vaultManager.connect(nonGovernor).setActiveStatusForVaultId(vaultId, true, true))
            .to.be.revertedWith("Authorization Error");
    })

  });

  describe("Vault does not Exists", function() {
    let vaultManager: VaultManager;
    let trustee: MockTrustee;
    let token: ERC20Token;
    let governor: Signer;
    const fakeVaultId = "9";


    beforeEach(async function () {
        const Token = await ethers.getContractFactory('ERC20Token');
        token = await Token.deploy("Token", "TKN");
        await token.deployed();
        
        const signers = await ethers.getSigners();
        governor = signers[0];

        const VaultManager = await ethers.getContractFactory('VaultManager');
        vaultManager = await VaultManager.deploy();
        await vaultManager.deployed();

        const Trustee = await ethers.getContractFactory('MockTrustee');
        trustee = await Trustee.deploy(vaultManager.address);
        await trustee.deployed();

        await vaultManager.setTrustee(trustee.address);
    });

    it("should fail to set deposit active status", async () => {
        await expect(vaultManager.setActiveStatusForVaultId(fakeVaultId, true, true))
            .to.be.revertedWith("VaultManager: Vault not found");
    })

    it("should fail to deposit", async () => {
        await expect(trustee.deposit(token.address, governor.getAddress(), 100))
            .to.be.revertedWith("VaultManager: No vaults for this token");
    })

    it("should fail to withdraw", async () => {
        await expect(trustee.withdraw(fakeVaultId, governor.getAddress(), 100))
            .to.be.revertedWith("VaultManager: Vault not found");
    })

    it("should fail to return balance", async () => {
        await expect(vaultManager.getVaultBalanceByVaultId(fakeVaultId))
            .to.be.revertedWith("VaultManager: Vault not found");
    })
    it("should fail to return balance", async () => {
        await expect(vaultManager.getVaultBalanceByVaultId(fakeVaultId))
            .to.be.revertedWith("VaultManager: Vault not found");
        await expect(vaultManager.getCurrentVaultBalanceByToken(token.address))
            .to.be.revertedWith("VaultManager: No vaults for this token");
    })

    it("should fail to return tokenAddress for vaultId which does not", async () => {
        await expect(vaultManager.vaultIdToTokenAddress(fakeVaultId))
            .to.be.revertedWith("VaultManager: Vault not found");
    })

    it("should return zero for mappings", async () => {
        expect(await vaultManager.vaultIdToVault(fakeVaultId)).to.equal(ethers.constants.AddressZero);
        expect(await vaultManager.isDepositActiveForVaultId(fakeVaultId)).to.equal(false);
        expect(await vaultManager.isWithdrawalActiveForVaultId(fakeVaultId)).to.equal(false);
    })
  })

  describe("Trustee Functions", function () {
    let vaultManager: VaultManager;
    let trustee: MockTrustee;
    let token: ERC20Token;
    let nonPermitted: Signer;
    let vaultId: string

    beforeEach(async function () {
        const Token = await ethers.getContractFactory('ERC20Token');
        token = await Token.deploy("Token", "TKN");
        await token.deployed();
        
        const signers = await ethers.getSigners();
        nonPermitted = signers[1];

        const VaultManager = await ethers.getContractFactory('VaultManager');
        vaultManager = await VaultManager.deploy();
        await vaultManager.deployed();

        const Trustee = await ethers.getContractFactory('MockTrustee');
        trustee = await Trustee.deploy(vaultManager.address);
        await trustee.deployed();

        await vaultManager.setTrustee(trustee.address);
        vaultId = (await vaultManager.callStatic.createNewVault(token.address)).toString();
        await vaultManager.createNewVault(token.address);
    });

    it("should fail to set EOA as trustee", async () => {
        await expect(vaultManager.setTrustee(nonPermitted.getAddress()))
            .to.be.revertedWith("VaultManager: EOA not allowed");
    })

    it("should fail to deposit", async () => {
      await expect(vaultManager.connect(nonPermitted).depositByToken(token.address, nonPermitted.getAddress(), 100))
          .to.be.revertedWith("VaultManager: Not Trustee");
    });
    it("should fail to withdraw", async () => {
      await expect(vaultManager.connect(nonPermitted).withdrawByVaultId(vaultId, nonPermitted.getAddress(), 100))
          .to.be.revertedWith("VaultManager: Not Trustee");
    });

  });

  describe("Deposite and Withdrawal Status", function() {
    let vaultManager: VaultManager;
    let trustee: MockTrustee;
    let token: ERC20Token;
    let governor: Signer;
    let vaultId: string

    beforeEach(async function () {
        const Token = await ethers.getContractFactory('ERC20Token');
        token = await Token.deploy("Token", "TKN");
        await token.deployed();
        
        const signers = await ethers.getSigners();
        governor = signers[0];

        const VaultManager = await ethers.getContractFactory('VaultManager');
        vaultManager = await VaultManager.deploy();
        await vaultManager.deployed();

        const Trustee = await ethers.getContractFactory('MockTrustee');
        trustee = await Trustee.deploy(vaultManager.address);
        await trustee.deployed();

        await vaultManager.setTrustee(trustee.address);
        vaultId = (await vaultManager.callStatic.createNewVault(token.address)).toString();
        await vaultManager.createNewVault(token.address);
        await vaultManager.setActiveStatusForVaultId(vaultId, false, false);
    });

    it("should fail to deposit", async () => {
      await expect(trustee.deposit(token.address, governor.getAddress(), 100))
         .to.be.revertedWith("VaultManager: Deposits are frozen");
    });

    it("should fail to withdraw", async () => {
      await expect(trustee.withdraw(vaultId, governor.getAddress(), 100))
         .to.be.revertedWith("VaultManager: Withdrawals are frozen");
    });

  })

  
});
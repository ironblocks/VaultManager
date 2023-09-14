# Vault Manager

## Description

Vault Manager is a smart contract project that helps other contracts manage ERC20 tokens and maintain whitelists for each token.

### Features

- Management of ERC20 tokens
- Whitelisting functionalities
- Owner-based actions

## Prerequisites

- [Hardhat](https://hardhat.org/getting-started/#overview)

## Installation

1. Clone the repository:

\```
git clone https://github.com/The-Poolz/VaultManager.git
\```

2. Install the dependencies:

\```
npm install
\```

3. Run the Hardhat test:

\```
npx hardhat test
\```

## Usage

After deploying the contracts, the owner (the deployer) can perform various operations.

### From an External Contract

#### Deposit

To deposit tokens into a vault, the external contract should call `depositByToken` from `VaultManager.sol`. Make sure that `msg.sender` is set to the `_from` address.

#### Withdraw

To withdraw tokens, the external contract must use `msg.sender` when calling the `withdraw` function.

### Owner Functionalities

If you are the owner of the deployed contracts, you have the following additional functionalities:

#### In VaultManager.sol

1. **Set Trade Start Time**: Using `setTradeStartTime`, you can set the trade start time for a specific vault ID.
2. **Set Trustee**: You can set the trustee address using `setTrustee`.
3. **Update Trustee**: You can update the trustee address using `updateTrustee`.
4. **Set Vault Royalty**: Using `setVaultRoyalty`, you can set the royalty details for a vault.
5. **Create New Vault**: This function has multiple overloads, allowing you to create new vaults with different configurations.

#### In Vault.sol

1. **Withdraw**: As the manager, you can withdraw tokens to a specified address using `withdraw`.

### Role of the Trustee

Only the trustee can use the tokens stored in the vaults, not the owner.

## Code Overview

### Solidity Contracts

- [IVault.sol](./contracts/Vault/IVault.sol): Defines the interface for Vault contract.
- [Vault.sol](./contracts/Vault/Vault.sol): Implements the Vault functionalities.
- [IVaultManager.sol](./contracts/VaultManager/IVaultManager.sol): Defines the interface for Vault Manager.
- [VaultManager.sol](./contracts/VaultManager/VaultManager.sol): Implements the Vault Manager functionalities.
- [VaultManagerEvents.sol](./contracts/VaultManager/VaultManagerEvents.sol): Contains events for Vault Manager.

### Tests

- [1_Vault.ts](./test/1_Vault.ts): Test cases for Vault.
- [2_VaultManager.ts](./test/2_VaultManager.ts): Test cases for Vault Manager.
- [3_VaultManagerFail.ts](./test/3_VaultManagerFail.ts): Negative test cases for Vault Manager.

## Contributing

Feel free to open an issue or submit a pull request.

## License

This project is licensed under the MIT License.

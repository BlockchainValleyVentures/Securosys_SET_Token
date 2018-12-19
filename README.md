# Securosys_SET_Token

## Token Functions
The Securosys SET Token is an ERC20 Compatible Security token, besides the standard ERC20 functions it has modules for:
* Minting
* Burning
* Pausing
* Locking transfers
* Paying dividends

For an in-depth description of all functions please read the [Specification](https://github.com/BlockchainValleyVentures/Securosys_SET_Token/blob/master/SET_Token/specification/setToken.pdf) .

## Getting Started
This process will get you a copy of the contract running localy for testing purposes:

### Installing Tools
The [Truffle Suite](https://truffleframework.com/) framework is used for development and testing.

Install Truffle:
```
npm install -g truffle
```
Install Dependencies:
```
npm install --save-dev chai chai-bignumber
```
```
npm install openzeppelin-solidity
```

### Running the Tests
To start running the tests you can either run:
```
truffle test
```
Or you can set up a development network and use that for testing:
```
truffle develop
```
```
test
```

### Compiling the Code
To compile the code run:
```
truffle compile
```





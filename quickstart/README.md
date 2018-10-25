# ICON SDK Javascript Quickstart

This is an example project of Icon SDK Javascript.

In this project, the examples are implemented as below.

| Example       | Description |
| ------------- | ----------- |
| WalletExample | An example of creating and loading a wallet. |
| IcxTransactionExample | An example of transferring ICX and confirming the result. |
| TokenTransactionExample | An example of transferring IRC token and confirming the result. |
| DeployTokenExample | An example of deploying token. |
| SyncBlockExample | An example of checking block confirmation and printing the ICX and token transfer information. |

### Get Started

#### Install Dependency
Please install dependency to use `icon-sdk-js`.

npm
```nodejs
npm install // install basic dependencies for executing the quickstart project
npm install --save icon-sdk-js // install icon-sdk-js
```

#### Run example file
Run example file.
```nodejs
npm start
// open http://localhost:3000/ in browser
```

#### Set Node URL

If you want to use custom ICON node url, change the value of `NODE_URL` variable in `./mockData/index.js`. Default value of `NODE_URL` is `https://testwallet.icon.foundation/api/v3`
```javascript
const NODE_URL = 'https://testwallet.icon.foundation/api/v3'; 
```


### IconService

Generate `IconService` to communicate with the nodes.

`IconService` allows you to send transaction, check the result and block information, etc.

`HttpProvider` is set as default to communicate with http.

```javascript
// HttpProvider is used to communicate with http.
const provider = new IconService.providers.HttpProvider(NODE_URL);
// Create IconService instance
const iconService = new IconService(provider);
```



---



### WalletExample

This example shows how to create a new `Wallet` and load wallet with privateKey or Keystore file.

#### Create

Create new EOA by calling `create` function. After creation, the address and private Key can be looked up.

```javascript
const { Wallet } = iconService;
const wallet = Wallet.create(); //Wallet Creation
console.log("Address: " + wallet.getAddress()); // Address Check
console.log("PrivateKey: " + wallet.getPrivateKey()); // PrivateKey Check

// Output
Address: hx4d37a7013c14bedeedbe131c72e97ab337aea159
PrivateKey: 00e1d6541bfd8be7d88be0d24516556a34ab477788022fa07b4a6c1d862c4de516
```

#### Load

You can call existing EOA by calling `loadKeystore` and `loadPrivateKey` function.

After creation, address and private Key can be looked up.

```javascript
// Load Wallet with private key
const walletLoadedByPrivateKey = Wallet.loadPrivateKey('86414d34ff8cdaa2bc335ac8f6bd56a16e15921a6b70ffad24ce47d47435275d');
console.log(walletLoadedByPrivateKey.getAddress());
// Output: hx56614cd4a1a7fcfd92e9a723b75f6cef04695226
console.log(walletLoadedByPrivateKey.getPrivateKey());
// Output: 86414d34ff8cdaa2bc335ac8f6bd56a16e15921a6b70ffad24ce47d47435275d);

// Get keystore object from wallet
const keystoreFile = walletLoadedByPrivateKey.store('qwer1234!');
// Load wallet with keystore file
const walletLoadedByKeyStore = Wallet.loadKeystore(keystoreFile, 'qwer1234!');
console.log(walletLoadedByKeyStore.getAddress());
// Output: hx56614cd4a1a7fcfd92e9a723b75f6cef04695226
console.log(walletLoadedByKeyStore.getPrivateKey());
// Output: 86414d34ff8cdaa2bc335ac8f6bd56a16e15921a6b70ffad24ce47d47435275d);
```

#### Store

After `Wallet` object creation, Keystore file can be stored by calling `store` function.

After calling `store`, Keystore json object can be looked up with the returned value.

```javascript
const privateKey = '86414d34ff8cdaa2bc335ac8f6bd56a16e15921a6b70ffad24ce47d47435275d'
const wallet = Wallet.loadPrivateKey(privateKey);
console.log(wallet.store('qwer1234!'));
// Output: 
// {
//     "version": 3,
//     "id": "5cadce02-7925-4dab-838c-efe58e181d5e",
//     "address": "hx56614cd4a1a7fcfd92e9a723b75f6cef04695226",
//     "crypto": {
//         "ciphertext": "5b79944249eda02e524334d5fbd3032cf63ea0b7d52fa19fb2652dc2d0a02ec2",
//         "cipherparams": {
//             "iv": "af911ac71940b33abd42bb96c7a31bf1"
//         },
//         "cipher": "aes-128-ctr",
//         "kdf": "scrypt",
//         "kdfparams": {
//             "dklen": 32,
//             "salt": "adc48f5f5719ca1e7709e784e88583ecf633332f0a36f0805837df80703b3cf8",
//             "n": 16384,
//             "r": 8,
//             "p": 1
//         },
//         "mac": "35c26237547c0a21f142cf1ae8d9d651d5eebe50f1c16d8608548f9f7ae12531"
//     }
// }
```



---



### IcxTransactionExample

This example shows how to transfer ICX and check the result.

*For the Wallet and IconService creation, please refer to the information above.*

#### ICX Transfer

In this example, you can create Wallet with `MockData.PRIVATE_KEY_1` and transfer 1 ICX to `MockData.WALLET_ADDRESS_2`.

```javascript
const wallet = Wallet.loadPrivateKey(MockData.PRIVATE_KEY_1);
const walletAddress = wallet.getAddress();
// 1 ICX -> 1000000000000000000 conversion
const value = IconAmount.of(1, IconAmount.Unit.ICX).toLoop();
console.log(value);
// Output: BigNumber {s: 1, e: 18, c: Array(1)}
```

You can get a step cost for transfering icx as follows.

```javascript
getDefaultStepCost() {
    const { Builder } = this.iconService;
    const { CallBuilder } = Builder;
    
    // Get apis that provides Governance SCORE
    const governanceApi = this.iconService.getScoreApi(MockData.GOVERNANCE_ADDRESS).execute();
    const methodName = 'getStepCosts';
    // Check input and output parameters of api if you need
    const getStepCostsApi = governanceApi.getMethod(methodName);
    console.log(`[getStepCosts]\n inputs: ${getStepCostsApi.inputs} \n outputs: ${getStepCostsApi.outputs}`);

    // Get step costs by iconService.call
    const callBuilder = new CallBuilder();
    const call = callBuilder
        .to(MockData.GOVERNANCE_ADDRESS)
        .method(methodName)
        .build();
    const stepCosts = this.iconService.call(call).execute();
    return stepCosts.default
    // Output: 0x186a0
}
```

Generate transaction using the values above.

```javascript
// networkId of node 1:mainnet, 2~:etc
const networkId = new BigNumber("2"); // input node’s networkld
const version = new BigNumber("3"); // version

// Recommended icx transfer step limit :
// use 'default' step cost in the response of getStepCosts API
const stepLimit = getDefaultStepCost(); // Please refer to the above description.

// Timestamp is used to prevent the identical transactions. Only current time is required (Standard unit : us)
// If the timestamp is considerably different from the current time, the transaction will be rejected.
const timestamp = (new Date()).getTime() * 1000;

//Enter transaction information
const icxTransactionBuilder = new IcxTransactionBuilder();
const transaction = icxTransactionBuilder
      .nid(networkId)
      .from(walletAddress)
      .to(MockData.WALLET_ADDRESS_2)
      .value(value)
      .version(version)
      .stepLimit(stepLimit)
      .timestamp(timestamp)
      .build();
```
Generate SignedTransaction to add signature of the transaction.

```javascript
// Create signature of the transaction
const signedTransaction = new SignedTransaction(transaction, wallet);
// Read params to transfer to nodes
console.log(signedTransaction.getProperties());
// Output: 
// {
//     from: "hx56614cd4a1a7fcfd92e9a723b75f6cef04695226",
//     nid: "0x2",
//     nonce: "0x1",
//     signature: "OE/yJbKn+3kXiC/5x1mvOCpdbTiCAvdlZDgSH31//alTe4kTEVRCETXsQx+Jkbfwa6Qel1PUddoowdkQJDLPrgE=",
//     stepLimit: "0x186a0",
//     timestamp: "0x578ed370a3780",
//     to: "hx5d61858c20ca7c1676740926faef0bc60ff7dc21",
//     value: "0xde0b6b3a7640000",
//     version: "0x3",
// }
```

After calling sendTransaction from `IconService`, you can send transaction and check the transaction’s hash value. ICX transfer is now sent.

```javascript
// Send transaction
const txHash = iconService.sendTransaction(signedTransaction).execute();
// Print transaction hash
console.log(txHash);
// Output
// 0x69c07ff23e2eafb068ec026f1a116082f0d869b3964531e43088f6638bcfe0f7
```

#### Check the Transaction Result

After transaction is sent, the result can be looked up with the returned hash value.

In this example, you can check your transaction result in every 2 seconds because of the block confirmation time.
Checking the result is as follows:

```javascript
// Check the result with the transaction hash
const transactionResult = iconService.getTransactionResult(txHash).execute();
console.log("transaction status(1:success, 0:failure): "+transactionResult.status);
// Output
// transaction status(1:success, 0:failure): 1
```

You can check the following information using the TransactionResult.

- status : 1 (success), 0 (failure)
- to : transaction’s receiving address
- failure : Only exists if status is 0(failure). code(str), message(str) property included
- txHash : transaction hash
- txIndex : transaction index in a block
- blockHeight : Block height of the transaction
- blockHash : Block hash of the transaction
- cumulativeStepUsed : Accumulated amount of consumed step’s until the transaction is executed in block
- stepUsed : Consumed step amount to send the transaction
- stepPrice : Consumed step price to send the transaction
- scoreAddress : SCORE address if the transaction generated SCORE (optional)
- eventLogs :  Occurred EventLog’s list during execution of the transaction.
- logsBloom : Indexed Data’s Bloom Filter value from the occurred Eventlog’s Data

#### Check the Balance

In this example, you can check the ICX balance by looking up the transaction before and after the transaction.

ICX balance can be confirmed by calling getBalance function from `IconService`

```javascript
// create or load wallet
const wallet = Wallet.loadPrivateKey(MockData.PRIVATE_KEY_2);
// Check the wallet balance
const balance = iconService.getBalance(wallet.getAddress()).execute();
console.log(balance);

// Output: 
// 100432143214321432143
```


---



### TokenTransactionExample

This example shows how to send token and check the balance.

*For Wallet and IconService generation, please refer to the information above.*

#### Token Transfer

You can send the token (`MockData.TOKEN_ADDRESS`) that is already generated as an example.

You can generate Wallet using `MockData.PRIVATE_KEY_1` just like in the case of `IcxTransactionExample`, then send 1 Token to `MockData.WALLET_ADDRESS_2`

You need token address to send your token.

```javascript
const wallet = Wallet.loadPrivateKey(MockData.PRIVATE_KEY_1);
const toAddress = MockData.WALLET_ADDRESS_2;
const tokenAddress = MockData.TOKEN_ADDRESS; //token Address
const tokenDecimals = 18; // token decimal
// 1 ICX -> 1000000000000000000 conversion
const value = IconAmount.of(1, IconAmount.Unit.ICX).toLoop();
```

You can get a step cost to send token as follows.

```javascript
getDefaultStepCost() {
    const { Builder } = this.iconService;
    const { CallBuilder } = Builder;
    
    // Get apis that provides Governance SCORE
    // GOVERNANCE_ADDRESS : cx0000000000000000000000000000000000000001
    const governanceApi = this.iconService.getScoreApi(MockData.GOVERNANCE_ADDRESS).execute();
    console.log(governanceApi)
    const methodName = 'getStepCosts';

    // Get step costs by iconService.call
    const callBuilder = new CallBuilder();
    const call = callBuilder
        .to(MockData.GOVERNANCE_ADDRESS)
        .method(methodName)
        .build();
    const stepCosts = this.iconService.call(call).execute();
    // For sending token, it is about twice the default value.
    return IconConverter.toBigNumber(stepCosts.default).times(2)
}
```

Generate Transaction with the given parameters above. You have to add receiving address and value to param object to send token.

```javascript
const { Builder } = this.iconService;
const { CallTransactionBuilder } = Builder;

const walletAddress = this.wallet.getAddress();
// You can use "governance score apis" to get step costs.
const value = IconAmount.of(1, IconAmount.Unit.ICX).toLoop();
const stepLimit = this.getDefaultStepCost();
// networkId of node 1:mainnet, 2~:etc
const networkId = IconConverter.toBigNumber(2);
const version = IconConverter.toBigNumber(3);
// Timestamp is used to prevent the identical transactions. Only current time is required (Standard unit : us)
// If the timestamp is considerably different from the current time, the transaction will be rejected.
const timestamp = (new Date()).getTime() * 1000;
// SCORE name that send transaction is “transfer”.
const methodName = "transfer";
// Enter receiving address and the token value.
// You must enter the given key name("_to", "_value"). Otherwise, the transaction will be rejected.
const params = {
    _to: MockData.WALLET_ADDRESS_2,
    _value: IconConverter.toHex(value)
}

//Enter transaction information
const tokenTransactionBuilder = new CallTransactionBuilder();
const transaction = tokenTransactionBuilder
    .nid(networkId)
    .from(walletAddress)
    .to(MockData.TOKEN_ADDRESS)
    .stepLimit(stepLimit)
    .timestamp(timestamp)
    .method(methodName)
    .params(params)
    .version(version)
    .build();        
return transaction;
```

Generate SignedTransaction to add signature to your transaction.

```javascript
// Generate transaction signature.
const signedTokenTransfer = new SignedTransaction(transaction, wallet);
// Read params to send to nodes.
console.log(signedTokenTransfer.getProperties());
```

 Call sendTransaction from ‘IconService’ to check the transaction hash. Token transaction is now sent.

```javascript
// Send transaction
const tokenTxHash = iconService.sendTransaction(signedTokenTransfer).execute();
// Print transaction hash
console.log(tokenTxHash);
// Output
// 0x6b17886de346655d96373f2e0de494cb8d7f36ce9086cb15a57d3dcf24523c8f
```

#### Check the Result

You can check the result with the returned hash value of your transaction.

In this example, you can check your transaction result in every 2 seconds because of the block confirmation time.
Checking the result is as follows:

```javascript
// Check the result with the transaction hash
const transactionResult = iconService.getTransactionResult(tokenTxHash).execute();
console.log("transaction status(1:success, 0:failure): "+transactionResult.status);
// Output
// transaction status(1:success, 0:failure):1
```

*For the TransactionResult, please refer to the `IcxTransactionExample`.*

#### Check the Token Balance

In this example, you can check the token balance before and after the transaction.

You can check the token balance by calling ‘balanceOf’ from the token SCORE.

```javascript
const { Builder } = this.iconService;
const { CallBuilder } = Builder;
const tokenAddress = MockData.TOKEN_ADDRESS;
// Method name to check the balance
const methodName = "balanceOf";
// You must enter the given key name (“_owner”).
const params = {
    _owner: address
}
const callBuilder = new CallBuilder();
const call = callBuilder
    .to(tokenAddress)
    .method(methodName)
    .params(params)
    .build();
// Check the wallet balance
const balance = this.iconService.call(call).execute();
```

---


### DeployTokenExample

This example shows how to deploy token and check the result.

*For the Wallet and IconService generation, please refer to the information above.*

#### Token Deploy

You need the SCORE Project to deploy token.

In this example, you will use ‘test.zi’ from the ‘resources’ folder.

*test.zi : SampleToken SCORE Project Zip file.

Generate wallet using `MockData.PRIVATE_KEY_1`, then read the binary data from ‘test.zi’

```javascript
const { Wallet } = this.iconService;
this.wallet = Wallet.loadPrivateKey(MockData.PRIVATE_KEY_1);

this.content = '';
// Read test.zi from ‘resources’ folder.
```

Enter the basic information of the token you want to deploy.

```javascript
const initialSupply = IconConverter.toBigNumber("100000000000");
const decimals = IconConverter.toBigNumber("18");
const tokenName = "StandardToken";
const tokenSymbol = "ST";
```

You can get the maximum step limit value as follows.

```javascript
// Get apis that provides Governance SCORE
// GOVERNANCE_ADDRESS : cx0000000000000000000000000000000000000001
 getMaxStepLimit() {
    const { Builder } = this.iconService;
    const { CallBuilder } = Builder;
    
    const governanceApi = this.iconService.getScoreApi(MockData.GOVERNANCE_ADDRESS).execute();
    // "getMaxStepLimit" : the maximum step limit value that any SCORE execution should be bounded by.
    const methodName = 'getMaxStepLimit';
    // Check input and output parameters of api if you need
    const getMaxStepLimitApi = governanceApi.getMethod(methodName);

    const params = {};
    params[getMaxStepLimitApi.inputs[0].name] = 'invoke';

    // Get max step limit by iconService.call
    const callBuilder = new CallBuilder();
    const call = callBuilder
        .to(MockData.GOVERNANCE_ADDRESS)
        .method(methodName)
        .params(params)
        .build();
    const maxStepLimit = this.iconService.call(call).execute();
    return IconConverter.toBigNumber(maxStepLimit)
}
```

Generate transaction with the given values above.

```javascript
const { Builder } = this.iconService;
const { DeployTransactionBuilder } = Builder;

const initialSupply = IconConverter.toBigNumber("100000000000");
const decimals = IconConverter.toBigNumber("18");
const tokenName = "StandardToken";
const tokenSymbol = "ST";
const contentType = "application/zip";
// Enter token information
// key name ("initialSupply", "decimals", "name", "symbol")
// You must enter the given values. Otherwise, your transaction will be rejected.
const params = {
    initialSupply: IconConverter.toHex(initialSupply),
    decimals: IconConverter.toHex(decimals),
    name: tokenName,
    symbol: tokenSymbol
}
const installScore = MockData.SCORE_INSTALL_ADDRESS;
const stepLimit = this.getMaxStepLimit();
const walletAddress = this.wallet.getAddress();
// networkId of node 1:mainnet, 2~:etc
const networkId = IconConverter.toBigNumber(2);
const version = IconConverter.toBigNumber(3);
// Timestamp is used to prevent the identical transactions. Only current time is required (Standard unit : us)
// If the timestamp is considerably different from the current time, the transaction will be rejected.
const timestamp = (new Date()).getTime() * 1000;

//Enter transaction information
const deployTransactionBuilder = new DeployTransactionBuilder();
const transaction = deployTransactionBuilder
    .nid(networkId)
    .from(walletAddress)
    .to(installScore)
    .stepLimit(stepLimit)
    .timestamp(timestamp)
    .contentType(contentType)
    .content(`0x${this.content}`)
    .params(params)
    .version(version)
    .build();        
return transaction; 
```

Generate SignedTransaction to add signature to the transaction.

```javascript
// Create signature of the transaction
const signedTransaction = new SignedTransaction(transaction, this.wallet);
// Read params to transfer to nodes
const signedTransactionProperties = JSON.stringify(signedTransaction.getProperties()).split(",").join(", \n");
```

You can check the transaction hash value by calling sendTransaction from ‘IconService`. Deployment is now completed.

```javascript
// Token Transfer
const transactionResult = this.iconService.getTransactionResult(this.txHash).execute();
```

*For the 'TransactionResult', please refer to the `IcxTransactionExample`.*



---



### SyncBlockExample

This example shows how to read block information and print the transaction result for every block creation.

*Please refer to above for Wallet and IconService creation.*

#### Read Block Information

In this example, 'getLastBlock' is called periodically in order to check the new blocks,

by updating the transaction information for every block creation.

```javascript
// Check the recent blocks
const block = iconService.getBlock('latest').execute();
console.log(block.height);
// Output
// 237845
```

If a new block has been created, get the transaction list.

```javascript
const txList = block.getTransactions();
```

You can check the following information using the ConfirmedTransaction:

- version : json rpc server version
- to : Receiving address of transaction
- value: The amount of ICX coins to transfer to the address. If omitted, the value is assumed to be 0
- timestamp: timestamp of the transmitting transaction (unit: microseconds)
- nid : network ID
- signature: digital signature data of the transaction
- txHash : transaction hash
- dataType: A value indicating the type of the data item (call, deploy, message)
- data: Various types of data are included according to dataType.

#### Transaction Output

```javascript
syncBlock(block) {
    // the transaction list of blocks
    console.log(block)
    const txList = block.getTransactions();
    for (let transaction of txList) {
        const txResult = this.iconService.getTransactionResult(transaction.txHash).execute();

        // Print icx transaction
        if ((transaction.value !== undefined) && transaction.value > 0) {
            document.getElementById("S03-2").innerHTML += `<li>${block.height} - [ICX] status: ${txResult.status === 1 ? 'success' : 'failure'}  |  amount: ${transaction.value}</li>`
        }

        // Print token transaction
        if (transaction.dataType !== undefined &&
            transaction.dataType === "call") {
            const method = transaction.data.method;

            if (method !== null && method === "transfer") {
                const params = transaction.data.params;
                const value = IconConverter.toBigNumber(params["_value"]); // value
                const toAddr = params["_to"]

                const tokenName = this.getTokenName(transaction.to);
                const symbol = this.getTokenSymbol(transaction.to);
                
                document.getElementById("S03-2").innerHTML += `<li>${block.height} - [${tokenName} - ${symbol}] status: ${txResult.status === 1 ? 'success' : 'failure'}  |  amount: ${value}</li>`;
            }
        }
    }
    this.prevHeight = block.height;
}

```

#### Check the Token Name & Symbol

You can check the token SCORE by calling the `name` and `symbol` functions.

```javascript
getTokenName(to) {
    const { Builder } = this.iconService;
    const { CallBuilder } = Builder;
    const tokenAddress = to; // token address
    const callBuilder = new CallBuilder();
    const call = callBuilder
        .to(tokenAddress)
        .method("name")
        .build();
    const result = this.iconService.call(call).execute();
    return result;
}
```
```javascript
getTokenSymbol(to) {
    const { Builder } = this.iconService;
    const { CallBuilder } = Builder;
    const tokenAddress = to; // token address
    const callBuilder = new CallBuilder();
    const call = callBuilder
        .to(tokenAddress)
        .method("symbol")
        .build();
    const result = this.iconService.call(call).execute();
    return result;
}
```



----------



### References

- [ICON JSON-RPC API v3](https://github.com/icon-project/icon-rpc-server/blob/master/docs/icon-json-rpc-v3.md) 



### Q&A

1. What is Wallet?
- A class that manages EOA's private / public key pair.
- Transaction message signing function.
- Keystore creation and import / export function.
2. What is keyStore file?
- Text / file that is encrypted with a private key.
3. What is stepLimit for?
-  Since transaction fee is required to send transaction, you can set the maximum fee limit. If your actual transaction fee exceeds the stepLimit that you have set, the transaction will fail but still your transaction fee(stepLimit) will be consumed.
4. What is networId?
- 1 for mainNet, etc
5. Why sendTransaction method is named as ‘transfer’, when transferring token?
- Transfer as a methodName means to transfer token
- [Refer to IRC2 Specification](https://github.com/icon-project/IIPs/blob/master/IIPS/iip-2.md)
6. What is httpProvider?
- Class that supports node and jsonRpc communication.

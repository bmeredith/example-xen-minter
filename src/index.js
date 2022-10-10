require("dotenv").config();
const readline = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});
const ethers = require("ethers");

if(process.env.SEED === undefined) {
  console.error("Please set SEED environment variable.");
  process.exit(-1);
}

if(process.env.NUM_WALLETS === undefined) {
  console.error("Please set NUM_WALLETS environment variable.");
  process.exit(-1);
}

if(process.env.CLAIM_ADDRESS === undefined) {
  console.error("Please set CLAIM_ADDRESS environment variable.");
  process.exit(-1);
}

const contractAddress = "0x06450dee7fd2fb8e39061434babcfc05599a6fb8";
const abi = [
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "term",
        "type": "uint256"
      }
    ],
    "name": "claimRank",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }, 
  {
    "inputs": [{
            "internalType": "address",
            "name": "other",
            "type": "address"
        }, {
            "internalType": "uint256",
            "name": "pct",
            "type": "uint256"
        }
    ],
    "name": "claimMintRewardAndShare",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }];
const hdNode = ethers.utils.HDNode.fromMnemonic(process.env.SEED);
const mainnetProvider = ethers.getDefaultProvider("mainnet");

async function main() {
  const xenContract = new ethers.Contract(contractAddress, abi, mainnetProvider);
  
  // clear screen
  process.stdout.write('\033c');

  console.log(
    '1) List Accounts\n' +
    '2) Mint XEN\n' +
    '3) Claim XEN\n' +
    '0) Exit'
  );

  readline.question("Enter an option: ", async input => {
    switch(input) {
      case '1': 
        listAccounts(); 
        break;
      case '2':
        await mint(xenContract);
        break;
      case '3':
        await claim(xenContract, process.env.CLAIM_ADDRESS);
        break;
      case '0':
        readline.close();
        return;
      default:
        readline.close();
        await main();
    }
  });
}

// list accounts to disperse eth to using disperse.app
function listAccounts() {
  for(let i=0; i < process.env.NUM_WALLETS;i++) {
    const wallet = getWallet(hdNode, mainnetProvider, i);
    console.log(wallet.address);
  }
}

// mint the xen with 1 day lockup
async function mint(xenContract) {
  for(let i=0; i < process.env.NUM_WALLETS;i++) {
    const wallet = getWallet(hdNode, mainnetProvider, i);
    const xen = xenContract.connect(wallet);

    console.log("Minting...")
    await xen.claimRank(1, {
      maxFeePerGas: ethers.utils.parseUnits("100", "gwei"),
      maxPriorityFeePerGas: ethers.utils.parseUnits("1.7", "gwei"),
    });
    console.log("Successfully minted!")
  }
}

// claim xen to specified address
async function claim(xenContract, claimAddress) {
  for(let i=0; i < process.env.NUM_WALLETS;i++) {
    const wallet = getWallet(hdNode, mainnetProvider, i);
    const xen = xenContract.connect(wallet);
    console.log("Claiming...");

    await xen.claimMintRewardAndShare(claimAddress, 100, {
      maxFeePerGas: ethers.utils.parseUnits("100", "gwei"),
      maxPriorityFeePerGas: ethers.utils.parseUnits("1.7", "gwei"),
    });

    console.log("Successfully claimed!");
  }
}

function getWallet(hdNode, mainnetProvider, path) {
  return new ethers.Wallet(hdNode.derivePath(`m/44'/60'/0'/0/${path}`)).connect(mainnetProvider);
}

main().then().catch(console.log);
# Example XEN Minter

### Requirements
* NodeJS v16+ (https://nodejs.org/)
* Yarn (`npm install -g yarn`)

### Usage
1. Rename `sample.env` to `.env` and fill in the variables.
   1. `SEED` is the seed phrase that will be used.
   2. `NUM_WALLETS` is the number of wallets that will be used to mint/claim XEN.
   3. `CLAIM_ADDRESS` is the wallet address to send all XEN to when claiming.
2. Open the directory where XEN Minter is located and run the following in order to start the app:
    ```console
    $ yarn
    $ yarn run start
    ```
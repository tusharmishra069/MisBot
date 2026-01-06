const xrpl = require("xrpl");

async function main() {
    // 1. Connect to Testnet
    const client = new xrpl.Client("wss://s.altnet.rippletest.net:51233");
    await client.connect();

    // 2. Create Wallets (Issuer & Hot Wallet)
    // In production, load from seed. Here we generate new ones for demo.
    const { wallet: issuer } = await client.fundWallet();
    const { wallet: hotWallet } = await client.fundWallet();

    console.log("Issuer:", issuer.address);
    console.log("Hot Wallet:", hotWallet.address);

    // 3. Configure Issuer (Default RippleState)
    // Enable DefaultRipple on Issuer so tokens can flow
    const settingsTx = {
        TransactionType: "AccountSet",
        Account: issuer.address,
        SetFlag: xrpl.AccountSetAsfFlags.asfDefaultRipple
    };
    await client.submitAndWait(settingsTx, { wallet: issuer });

    // 4. Create TrustLine (Hot -> Issuer)
    const currencyCode = "MIS";
    const trustSetTx = {
        TransactionType: "TrustSet",
        Account: hotWallet.address,
        LimitAmount: {
            currency: currencyCode,
            issuer: issuer.address,
            value: "1000000000" // Limit
        }
    };
    await client.submitAndWait(trustSetTx, { wallet: hotWallet });

    // 5. Issue Tokens (Issuer -> Hot)
    const issueTx = {
        TransactionType: "Payment",
        Account: issuer.address,
        Amount: {
            currency: currencyCode,
            issuer: issuer.address,
            value: "1000000" // Initial supply
        },
        Destination: hotWallet.address
    };
    await client.submitAndWait(issueTx, { wallet: issuer });

    console.log(`Issued 1,000,000 ${currencyCode} to Hot Wallet.`);
    client.disconnect();
}

main();

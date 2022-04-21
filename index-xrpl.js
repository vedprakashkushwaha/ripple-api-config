const xrpl = require("xrpl");

async function main() {
    const hotwalletAddresses = ['rJdafLdhkGAgASnPqBKPJKUPNii9ZY3hvd'];
    // Define the network client
    const client = new xrpl.Client("wss://s.altnet.rippletest.net:51233")
    await client.connect()

    
    client.request({
        "command": "subscribe",
       // "streams": ["ledger"],
        accounts: hotwalletAddresses,
    })

    client.on('transaction', async (ledger) => {
        console.log(`\n✔*********************Transaction 📜 received start********************\n`, ledger, '\n--------------------------------------------------------\n');
        await client.disconnect();
        await client.connect();
    })

    // client.on("ledgerClosed", async (ledger) => {
    //     console.log(`Ledger #${ledger.ledger_index} validated with ${ledger.txn_count} transactions!`)
    // })

    // client.disconnect()
}

main()

const xrpl = require("xrpl");
const hotwalletAddresses = ['rJdafLdhkGAgASnPqBKPJKUPNii9ZY3hvd']
const client = new xrpl.Client("wss://s.altnet.rippletest.net:51233");


client.on('disconnected', (code) => {
    console.log('🔴🔌disconnect event triggered, code:', code);
});

client.on('error', (errorCode, errorMessage) => {
    console.log('🔴Error event triggered ', errorCode + ': ' + errorMessage);
});

client.on('connected', async () => {
    console.log('🔌✅connect event triggered');
    client.request({
        command: 'subscribe',
        accounts: hotwalletAddresses,
    });
});

client.on('transaction', (transactionData) => {
    console.log('\n📜Transaction\n', transactionData);
});

client.connect().then(() => {
    client.request({
        command: 'subscribe',
        accounts: hotwalletAddresses,
    });
}).catch((error) => {
    console.log('🔴 ERROR: Ripple server connection error!!\n\n', error);
    client.disconnect();
});





//This code segment only for create test scenario
setTimeout(async () => {
    await client.disconnect();
    client.connect().then(() => {

    }).catch((error) => {
        console.log('🔴 ERROR: Ripple server connection error!!\n\n', error);
        client.disconnect();
    });
}, 1000 * 30);
const xrpl = require("xrpl");
const hotwalletAddresses = ['rJdafLdhkGAgASnPqBKPJKUPNii9ZY3hvd']
const client = new xrpl.Client("wss://s.altnet.rippletest.net:51233");
client.connect();

client.on('disconnected', (code) => {
    console.log('🔴🔌disconnect event triggered, code:', code);
});

client.on('error', (errorCode, errorMessage) => {
    console.log('🔴Error event triggered ', errorCode + ': ' + errorMessage);
});

client.on('connected', async () => {
    console.log('🔌✅connect event triggered');
    client.connection.on('transaction', (transactionData) => {
        console.log('\n📜Transaction\n', transactionData);
    });
    return client.connection.request({
        command: 'subscribe',
        accounts: hotwalletAddresses,
    });
});


client.connect().then(() => {
    console.log('Ripple server connected to: ');
}).catch((error) => {
    console.log('🔴 ERROR: Ripple server connection error!!\n\n', error);
    client.disconnect();
});


//This code segment only for create test scenario
setInterval(() => {
    if (client.isConnected()) {
        
        client.disconnect().then(() => {
            console.log('🔌🔴Disconnected by set interval: ');
        }).catch((error) => {
            console.log('🔌🔴🔴 error while disconnecting form set interval!!\n\n', error);
            client.disconnect();
        });
    }
}, 1000*90);

setInterval(() => {
    if (!client.isConnected()) {
        client.connect().then(() => {
            console.log('🔌✅ connected by set interval: ');
        }).catch((error) => {
            console.log('🔌🔴🔴 error while connecting form set interval!!\n\n', error);
            client.disconnect();
        });
    }
}, 1000*30);

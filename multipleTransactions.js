//I have written this code only to elaborate issue
//In this program first 60 second transaction event triggers only once for each transactions but after 60 second transaction triggers 2 time for every transactions

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
setTimeout(async () => {
   await client.disconnect();
  await client.connect();
},1000*60);


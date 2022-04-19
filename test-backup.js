
const { RippleAPI } = require('ripple-lib');
const pm2 = require('pm2');
const config = {
    server: 'ws://xrp-testnet-lb-810822449.eu-west-2.elb.amazonaws.com:6005', // w3villa testnet
    // server: 'wss://s.altnet.rippletest.net:51233',
    trace: false,
    timeout: 10000
};

const api = new RippleAPI(config);

api.connect().then(() => {
    console.log('Ripple server connected to: ', config);
}).catch((error) => {
    console.log('ERROR: Ripple server connection error!!\n\n', error);
    api.disconnect();
});
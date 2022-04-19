const { RippleAPI } = require('ripple-lib');
const pm2 = require('pm2');

// pm2.connect((err) => {
//     if (err) {
//         console.error(err);
//         process.exit(2);
//     }

//     console.log('pm2 connected');

//     pm2.list((error, list) => {
//         for (let i = 0; i < list.length; i++) {
//             if (list[i].name == 'test-xrp-server') {
//                 FIRST_INSTANCE_ID = list[i].pm2_env.pm_id;
//                 break;
//             }
//         }

//         console.log('FIRST_INSTANCE_ID: ', FIRST_INSTANCE_ID, 'CURRENT_INSTANCE_ID:', process.env.pm_id, 'development');
//         if (process.env.pm_id == FIRST_INSTANCE_ID || sails.config.env == 'development') {
//             setTimeout(() => {
//                 for (let job in allJobs) {
//                    sails.hooks.cron.jobs[job].start();
//                 }
//             }, 3000);
//         }
//     });
// });



// const config = {
//     server: 'ws://xrp-testnet-lb-810822449.eu-west-2.elb.amazonaws.com:6005', // w3villa testnet
//     trace: false,
//     timeout: 5000
// }

// const api = new RippleAPI(config);




// api.on('connected', async () => {
//     rippleServerConnected = true;
//     sails.log.info('Ripple server connection successful.');

//     pm2.connect((err) => {
//         if (err) {
//             sails.log.error(err);
//             process.exit(2);
//         }

//         sails.log.info('pm2 connected');

//         pm2.list(async (error, list) => {
//             // for (let i = 0; i < list.length; i++) {
//             //     if (list[i].name == 'SuperOne') {
//             //         FIRST_INSTANCE_ID = list[i].pm2_env.pm_id;
//             //         break;
//             //     }
//             // }
//             // sails.log.info('RIPPLE_FIRST_INSTANCE_ID: ', FIRST_INSTANCE_ID);
//             // sails.log.info('RIPPLE_CURRENT_INSTANCE_ID:', process.env.pm_id);
//             // if (process.env.pm_id == FIRST_INSTANCE_ID || sails.config.env == 'development') {
//             //     api.connection.on('transaction', (transactionData) => {
//             //         saveTransactionAsCredit(transactionData);
//             //     });
//             //     const hotwalletAddresses = await rippleHandler.getHotWalletAddress();

//             //     sails.log.info('Listening to hot wallet address:', hotwalletAddresses, FIRST_INSTANCE_ID);

//             //     mailHandler.sem(mailContent.rippleServerConnected.s, `${mailContent.rippleServerConnected.c} on instance ID: ${process.env.pm_id}`);

//             //     // Set require destination tag for hot wallet
//             //     setRequireDestinationTag(hotwalletAddresses);
//             //     return api.connection.request({
//             //         command: 'subscribe',
//             //         accounts: hotwalletAddresses,
//             //     });
//             // }
//         });
//     });
// });

const config = {
    server: 'ws://xrp-testnet-lb-810822449.eu-west-2.elb.amazonaws.com:6005', // w3villa testnet
    trace: false,
    timeout: 5000
}
const api = new RippleAPI(config);
api.connect().then(() => {
    console.log('Ripple server connected to: ', config);
}).catch((error) => {
    console.log('ERROR: Ripple server connection error\n\n', error);
    api.disconnect();
});
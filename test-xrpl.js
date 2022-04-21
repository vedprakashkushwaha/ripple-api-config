const { RippleAPI } = require('ripple-lib');
const xrpl = require("xrpl");
const pm2 = require('pm2');
const Cryptr = require('cryptr');

const config = {
    // server: 'ws://xrp-testnet-lb-810822449.eu-west-2.elb.amazonaws.com:6005', // w3villa testnet
    server: 'wss://s.altnet.rippletest.net:51233',
    trace: false,
    timeout: 10000
};

// const api = new RippleAPI(config);
const client = new xrpl.Client("wss://s.altnet.rippletest.net:51233");
client.connect();
const api = client;

// 📜 🔴 ✅ 🔌 🛠️ ✔ 

api.on('disconnected', (code) => {
    console.log('🔴 disconnect event triggered, code:', code);
});

api.on('error', (errorCode, errorMessage) => {
    console.log('🔴 Error event triggered ', errorCode + ': ' + errorMessage);
});


api.on('connected', async () => {
    rippleServerConnected = true;
    console.log('✅ Ripple server connection successful.');
    pm2.connect((err) => {
        if (err) {
            console.log(err);
            process.exit(2);
        }
        pm2.list(async (error, list) => {
            for (let i = 0; i < list.length; i++) {
                if (list[i].name == 'test-xrp-server') {
                    FIRST_INSTANCE_ID = list[i].pm2_env.pm_id;
                    break;
                }
            }
            console.log('RIPPLE_FIRST_INSTANCE_ID: ', FIRST_INSTANCE_ID, 'process.env.pm_id:', process.env.pm_id);
            if (process.env.pm_id == FIRST_INSTANCE_ID) {
                api.connection.on('transaction', (transactionData) => {
                    console.log('\n✔********************* 📜Transaction received start********************\n', transactionData, '\n--------------------------------------------------------\n');
                    //saveTransactionAsCredit(transactionData);
                    // api.disconnect().then(() => {
                    //     console.log('Ripple server disconnected to: ');
                    //     if (!api.isConnected()) {
                    //         api.connect().then(() => {
                    //             // console.log('Ripple server connected to: ', config);
                    //         }).catch((error) => {
                    //             console.log('🔴 ERROR: Ripple server connection error!!\n\n', error);
                    //             api.disconnect();
                    //         });
                    //     }
                    // }).catch((error) => {
                    //     console.log('🔴 ERROR: Ripple server disconnect error!!\n\n', error);
                    //     api.disconnect();
                    // });

                });
                const hotwalletAddresses = ['rJdafLdhkGAgASnPqBKPJKUPNii9ZY3hvd']
                console.log('🔌 Listening to hot wallet address:', hotwalletAddresses, FIRST_INSTANCE_ID);
                // console.log(`📜 ${mailContent.rippleServerConnected.c} on instance ID: ${process.env.pm_id}`);
                // Set require destination tag for hot wallet
                setRequireDestinationTag(hotwalletAddresses);
                return api.connection.request({
                    command: 'subscribe',
                    accounts: hotwalletAddresses,
                });
            }
        });
    });
});


async function setRequireDestinationTag(hotwalletAddresses) {
    console.log('🔌 Setting require destination tag on hot wallet addresses:', hotwalletAddresses);
    try {
        let setting;
        await hotwalletAddresses.forEach(async (address) => {
            console.log('🔴 loop ke ander: ', address);
            setting = await api.getSettings(address).catch((error) => {
                console.log('🔴XRP api getSettings Error: ', error);
                throw new Error(error);
            });
            console.log('🔴XRP api getSettings Errorswqdqwddqwdqw: ', setting);

            if (setting && setting.requireDestinationTag) {
                console.log("🔴🔴a: ", address)
                console.log("🔴🔴s: ", setting)
                setRequireDestinationTagOnLedger(address);
            }
        });
    } catch (error) {
        console.log('🔴setRequireDestinationTag Error: ', error);
    }
}

function getHotWalletSecret(address) {
    const cryptr = new Cryptr('mojow@190195');
    const decryptedKey = cryptr.decrypt('04e0a41cdfafeab4014a492844bb0fbba99c69a4c1eda6c41583ffcb40b48d38bf4a3e701e25beb99b6af4186b8197b32b475eb46c7a09879a72f4ceb4121e347cd5e536470d3076738e59db84cce03362f8f88647c592faac1f79aaf8dbfb44eeda9fdaa5bd4b2daf4234b0c9934762e420a19c1d8ea2b1bf12280327');
    return decryptedKey;
};

async function setRequireDestinationTagOnLedger(address) {
    try {
        const tx = await api.prepareSettings(address, {
            requireDestinationTag: true,
        });
        console.log("🔴🔴tx: ", tx)
        const signedBlob = await signTransactionAndGetBlob(tx, getHotWalletSecret(address));

        console.log('🔴🔴signedBlob: ', signedBlob);
        const transaction = await sendSignedBlob(signedBlob);
        console.log('transaction: ', transaction);
    } catch (error) {
        console.log('setRequireDestinationTagOnLedger Error: ', error);
    }
}

// Sign a transaction
async function signTransactionAndGetBlob(tx, secretKey) {
    try {
        const { txJSON } = tx;
        const signedTx = await api.sign(txJSON, secretKey);
        const signedBlob = signedTx.signedTransaction;
        return (signedBlob);
    } catch (error) {
        console.log('Error in signTransactionAndGetBlob: \n', error);
        throw new Error('SUPERONE_ERROR Unable to sign XRP transaction.');
    }
}

// Get admin secret
function sendSignedBlob(address) {
    const cryptr = new Cryptr('mojow@190195');
    const decryptedKey = cryptr.decrypt('04e0a41cdfafeab4014a492844bb0fbba99c69a4c1eda6c41583ffcb40b48d38bf4a3e701e25beb99b6af4186b8197b32b475eb46c7a09879a72f4ceb4121e347cd5e536470d3076738e59db84cce03362f8f88647c592faac1f79aaf8dbfb44eeda9fdaa5bd4b2daf4234b0c9934762e420a19c1d8ea2b1bf12280327');
    return decryptedKey;
};

// Send a signed blob to XRP server for transaction
function sendSignedBlob(signedBlob) {
    return new Promise((async (resolve, reject) => {
        try {
            const transaction = await api.submit(signedBlob);
            console.log('sendSignedBlob: transaction: ', transaction);
            if (["tesSUCCESS", "terQUEUED"].includes(transaction.resultCode)) {
                return resolve(transaction);
            }
            console.log('tesSUCCESS not received from Ripple: ', transaction);
            return reject("SUPERONE_ERROR Unable to transfer due to error code " + transaction.resultCode);
        } catch (error) {
            console.log('Error in sendSignedBlob: \n', error);
            return reject("SUPERONE_ERROR Unable to send signed blob to XRP server.");
        }
    }));
}


// if (!api.isConnected()) {
//     api.connect().then(() => {
//         // console.log('Ripple server connected to: ', config);
//     }).catch((error) => {
//         console.log('🔴 ERROR: Ripple server connection error!!\n\n', error);
//         api.disconnect();
//     });
// }

api.connect().then(() => {
    console.log('Ripple server connected to: ', config);
}).catch((error) => {
    console.log('🔴 ERROR: Ripple server connection error!!\n\n', error);
    api.disconnect();
});

setInterval(() => {
    if (api.isConnected()) {
        api.disconnect().then(() => {
            console.log('🔌🔴Disconnected by set interval: ', config);
        }).catch((error) => {
            console.log('🔌🔴🔴 error while disconnecting form set interval!!\n\n', error);
            api.disconnect();
        });
    }
}, 1000*90);

setInterval(() => {
    if (!api.isConnected()) {
        api.connect().then(() => {
            console.log('🔌✅ connected by set interval: ', config);
        }).catch((error) => {
            console.log('🔌🔴🔴 error while connecting form set interval!!\n\n', error);
            api.disconnect();
        });
    }
}, 1000*30);
// api.disconnect().then(() => {
//     console.log('Ripple server disconnected to: ');
// }).catch((error) => {
//     console.log('🔴 ERROR: Ripple server disconnect error!!\n\n', error);
//     api.disconnect();
// });

// disconnected

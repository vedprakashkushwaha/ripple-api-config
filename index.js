const { RippleAPI } = require('ripple-lib');
const pm2 = require('pm2');
const config = {
    // server: 'ws://xrp-testnet-lb-810822449.eu-west-2.elb.amazonaws.com:6005', // w3villa testnet
    server: 'wss://s.altnet.rippletest.net:51233',
    trace: false,
    timeout: 10000
};
var api = new RippleAPI(config);
// api.disconnect();


// π π΄ β π π οΈ β 

api.on('disconnected', async (code) => {
    console.log('π΄ disconnect event triggered, code:', code);
    //await api.disconnect();
});

api.on('error', async (errorCode, errorMessage) => {
    console.log('π΄ Error event triggered ', errorCode + ': ' + errorMessage);
    await api.disconnect();
});

pm2.connect((err) => {
    pm2.list(async (error, list) => {
        for (let i = 0; i < list.length; i++) {
            if (list[i].name == 'test-xrp-server') {
                FIRST_INSTANCE_ID = list[i].pm2_env.pm_id;
                break;
            }
        }
        if (process.env.pm_id == FIRST_INSTANCE_ID) {
            api.connection.on('transaction', (transactionData) => {
                console.log('Transactionπ', transactionData);
            });

        }
    });
});

api.on('connected', async () => {
    rippleServerConnected = true;
    console.log('β Ripple server connection successful.');
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
                console.log("β This is the first instance of the XRP server.");

                const hotwalletAddresses = ['rJdafLdhkGAgASnPqBKPJKUPNii9ZY3hvd']
                console.log('π Listening to hot wallet address:', hotwalletAddresses, FIRST_INSTANCE_ID);


                setRequireDestinationTag(hotwalletAddresses);
                return api.connection.request({
                    command: 'subscribe',
                    accounts: hotwalletAddresses,
                });
            }
        });
    });
});



// pm2.connect((err) => {
//     if (err) {
//         console.log(err);
//         process.exit(2);
//     }
//     pm2.list(async (error, list) => {
//         for (let i = 0; i < list.length; i++) {
//             if (list[i].name == 'test-xrp-server') {
//                 FIRST_INSTANCE_ID = list[i].pm2_env.pm_id;
//                 break;
//             }
//         }
//         if (process.env.pm_id == FIRST_INSTANCE_ID) {
//             console.log("dusra wala : ", FIRST_INSTANCE_ID);
//         }
//     });
// });


async function setRequireDestinationTag(hotwalletAddresses) {
    try {
        let setting;
        hotwalletAddresses.forEach(async (address) => {
            setting = await api.getSettings(address).catch((error) => {
                console.log('XRP api getSettings Error: ', error);
                throw new Error(error);
            });
            if (setting && !setting.requireDestinationTag) {
                setRequireDestinationTagOnLedger(address);
            }
        });
    } catch (error) {
        console.log('setRequireDestinationTag Error: ', error);
    }
}

async function setRequireDestinationTagOnLedger(address) {
    try {
        const tx = await api.prepareSettings(address, {
            requireDestinationTag: true,
        });

        const signedBlob = await signTransactionAndGetBlob(tx, getHotWalletSecret(address));

        console.log('signedBlob: ', signedBlob);
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




api.connect().then(() => {
    console.log('Ripple server connected to: ', config);
}).catch(async (error) => {
    console.log('π΄ ERROR: Ripple server connection error!!\n\n', error);
    await api.disconnect();
});

setTimeout(
    async () => {
        await api.disconnect()
        await api.connect();
    }, 1000*30);


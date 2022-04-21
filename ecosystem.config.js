module.exports = {
    apps: [{
        name: 'test-xrp-server',
        script: 'index.js',
        instances: 'max',
       exec_mode: 'cluster',
        autorestart: true,
        watch: false,
        max_memory_restart: '31G',
        instance_var: 'INSTANCE_ID',
        mergeLogs: true,
    }],
};

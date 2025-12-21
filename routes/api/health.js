const Router = require('express').Router();
const c = require('@joelmo/console-color')();

Router.get('/ping', async (req, res) => {
    try {
        return res.status(200).send({ status: 'success', message: 'Pong' });
    } catch (err) {
        c.log('red', `[ERROR] ${err}`);
        return res.status(500).send({ status: 'error', message: 'Internal Server Error' });
    }
});
Router.get('/uptime', async (req, res) => {
    try {
        return res.status(200).send({ status: 'success', uptime: process.uptime() });
    } catch (err) {
        c.log('red', `[ERROR] ${err}`);
        return res.status(500).send({ status: 'error', message: 'Internal Server Error' });
    }
});
// More health routes will be added in the future
module.exports = Router;
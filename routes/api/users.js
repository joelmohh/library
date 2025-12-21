const Router = require('express').Router();
const bcrypt = require('bcrypt');
const c = require('@joelmo/console-color')();
const jwt = require('jsonwebtoken');
//const sendEmail = require('../../modules/sendEmail');

const User = require('../../models/User');

const { getLoginInformation, isAdmin } = require('../../modules/verify');

// REGISTER and LOGIN routes are in auth.js

Router.get('/all/:number/:page', getLoginInformation, isAdmin,  async (req, res) => {
    try {
        const number = parseInt(req.params.number);
        const page = parseInt(req.params.page);
        if (isNaN(number) || isNaN(page) || number <= 0 || page < 0) {
            return res.status(400).send({ status: 'error', message: 'Invalid pagination parameters' });
        }
        const users = await User.find().skip(page * number).limit(number).select('-password').exec();
        return res.status(200).send({ status: 'success', data: users });
    } catch (err) {
        c.log('red', `[ERROR] ${err}`);
        return res.status(500).send({ status: 'error', message: 'Internal Server Error' });
    }
});
Router.delete('/delete', getLoginInformation, isAdmin, async (req, res) => {
    try {
        const { userId } = req.body;
        if (!userId) {
            return res.status(400).send({ status: 'error', message: 'Missing required fields' });
        }
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).send({ status: 'error', message: 'User not found' });
        }
        await User.deleteOne({ _id: userId });
        return res.status(200).send({ status: 'success', message: 'User deleted successfully' });
    } catch (err) {
        c.log('red', `[ERROR] ${err}`);
        return res.status(500).send({ status: 'error', message: 'Internal Server Error' });
    }
});
Router.put('/update', getLoginInformation, isAdmin, async (req, res) => {
    try {
        const { userId, name, email, type } = req.body;
        if (!userId || !name || !email || !type) {
            return res.status(400).send({ status: 'error', message: 'Missing required fields' });
        }
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).send({ status: 'error', message: 'User not found' });
        }
        user.name = name;
        user.email = email;
        user.type = type;
        await user.save();
        return res.status(200).send({ status: 'success', message: 'User updated successfully' });
    } catch (err) {
        c.log('red', `[ERROR] ${err}`);
        return res.status(500).send({ status: 'error', message: 'Internal Server Error' });
    }
});
module.exports = Router;
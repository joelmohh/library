const Router = require('express').Router();
const c = require('@joelmo/console-color')();

const { isLoggedIn } = require('../modules/verify');

// Load Models
const Lending = require('../models/Lending');
const User = require('../models/User');

Router.get('/', isLoggedIn, async (req, res) => {
    try {
        const lendings = await Lending.find({ userId: req.session.user.id }).populate('book').exec();
        const notifications = await User.findById(req.session.user.id).select('notifications').exec();

        const loadInformations = {
            lending: {
                length: lendings.length,
                list: lendings
            },
            user: {
                id: req.session.user.id,
                name: req.session.user.name,
                email: req.session.user.email,
                type: req.session.user.type
            },
            notifications: {
                length: notifications.notifications.length,
                list: notifications.notifications
            }
        }

        res.render('student/index', { title: 'Student Dashboard', loadInformations });

    } catch (err) {
        c.log('red', `[ERROR] ${err}`);
        res.status(500).send({ status: 'error', message: 'Internal Server Error' });
    }
})
Router.get('/notifications', isLoggedIn, async (req, res) => {
    try {
        const notifications = await User.findById(req.session.user.id).select('notifications').exec();

        res.render('student/notifications', {
            title: 'Notifications',
            notifications: {
                list: notifications.notifications,
                total: notifications.notifications.length
            }
        });
    } catch (err) {
        c.log('red', `[ERROR] ${err}`);
        res.status(500).send({ status: 'error', message: 'Internal Server Error' });
    }
});

Router.get('/settings', isLoggedIn, (req, res) => {
    const currentUserInfo = {
        email: req.session.user.email,
        name: req.session.user.name,
        type: req.session.user.type,
        password: {
            length: req.session.user.password.length,
            lastChanged: req.session.user.passwordLastChanged,
            default: req.session.user.isDefaultPassword
        },
        id: req.session.user.id,
        username: req.session.user.username
    }

    res.render('settings/index', { title: 'Settings', user: currentUserInfo });
});

module.exports = Router;
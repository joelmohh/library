const Router = require('express').Router();
const c = require('@joelmo/console-color')();

const { isLoggedIn } = require('../modules/verify');

// Load Models
const Lending = require('../models/Lending');
const User = require('../models/User');

Router.get('/home', isLoggedIn, async (req, res) => {
    try {
        const lendings = await Lending.find({ userId: req.session.user.id }).populate('book').exec();

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
            }
        }

        res.render('student/index', { title: 'Student Dashboard', loadInformations, currentUser: req.session.user });

    } catch (err) {
        c.log('red', `[ERROR] ${err}`);
        res.status(500).send({ status: 'error', message: 'Internal Server Error' });
    }
})

module.exports = Router;
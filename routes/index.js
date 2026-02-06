const Router = require('express').Router();
const c = require('@joelmo/console-color')();

const Book = require('../models/Book');
const { redirectIfLoggedIn } = require('../modules/verify');

Router.get('/', async (req, res) => {
    try{
        const books = await Book.find().exec();
        
        res.render('index', { title: 'Home', books });

    } catch(err){
        c.log('red', err);
        res.status(500).send({ status: 'error', message: 'Internal Server Error' });
    }
})

Router.get('/auth/login', redirectIfLoggedIn, (req, res) => {
    res.render('auth/login', { title: 'Login' });
});

Router.get('/auth/forgot-password', redirectIfLoggedIn, (req, res) => {
    res.render('auth/forgot-password', { title: 'Forgot Password' });
});

Router.get('/auth/reset-password', redirectIfLoggedIn, (req, res) => {
    res.render('auth/reset-password', { title: 'Reset Password' });
});

module.exports = Router;
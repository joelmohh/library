const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
require('dotenv').config();
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const c = require('@joelmo/console-color')()

const { initializeCronJobs } = require('./modules/cronJobs');

const app = express();
app.use(bodyParser.json());
app.use(cors());
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
}));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

mongoose.connect(process.env.MONGODB_URI).then(() => {
    c.log('green', '[INFO] Connected to MongoDB');
    
    initializeCronJobs();
}).catch(err => {
    c.log('red', '[ERROR] MongoDB connection error:', err);
});

app.use('/api/lendings', require('./routes/api/lendings'));
app.use('/api/users', require('./routes/api/users'));
app.use('/api/books', require('./routes/api/books'));
app.use('/api/auth', require('./routes/api/auth'));
app.use('/api/health', require('./routes/api/health'));

app.use('/', require('./routes/index'));
app.use('/dashboard', require('./routes/dashboard'));
app.use('/student', require('./routes/student'));
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    c.log('green', `[INFO] Server is running on port ${PORT}`);
});
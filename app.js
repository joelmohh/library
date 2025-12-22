const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
require('dotenv').config();
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

// Colorful console logging (optional)
const c = require('@joelmo/console-color')()

// Initialize cron jobs
const { initializeCronJobs } = require('./modules/cronJobs');

// Initialize Express app and setup basic middleware
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

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI).then(() => {
    c.log('green', '[INFO] Connected to MongoDB');
    
    initializeCronJobs();
}).catch(err => {
    c.log('red', '[ERROR] MongoDB connection error:', err);
});

/*
/  App routes loaded by Routing System
*/

// API Routes
app.use('/api/lendings', require('./routes/api/lendings')); //OK
app.use('/api/users', require('./routes/api/users')); //OK
app.use('/api/books', require('./routes/api/books')); //OK
app.use('/api/auth', require('./routes/api/auth')); // OK
//app.use('/api/settings', require('./routes/api/settings'));
app.use('/api/health', require('./routes/api/health')); // OK

// Frontend Routes
app.use('/', require('./routes/index'));
app.use('/dashboard', require('./routes/dashboard'));
app.use('/student', require('./routes/student'));


/*
/  Server Initialization
*/
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    c.log('green', `[INFO] Server is running on port ${PORT}`);
});
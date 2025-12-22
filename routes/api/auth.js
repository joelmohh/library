const Router = require('express').Router();
const bcrypt = require('bcrypt');
const c = require('@joelmo/console-color')();
const jwt = require('jsonwebtoken');
//const sendEmail = require('../../modules/sendEmail');

const User = require('../../models/User');

const { redirectIfLoggedIn, getLoginInformation } = require('../../modules/verify');

Router.post('/register', redirectIfLoggedIn, async (req, res) => {
    try {
        const { name, email, password, type, username } = req.body;

        if (!name || !email || !password || !type || !username) {
            return res.status(400).send({ status: 'error', message: 'All fields are required, missing one or more fields' });
        }

        const existingUser = await User.findOne({ $or: [{ email }, { username }] }).exec();
        if (existingUser) {
            return res.status(409).send({ status: 'error', message: 'User with this email or username already exists, try logging in' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            type,
            username
        });

        await newUser.save();

        res.status(201).send({ status: 'success', message: 'User registered successfully' });
    } catch (err) {
        c.log('red', `[ERROR] ${err}`);
        res.status(500).send({ status: 'error', message: 'Internal Server Error' });
    }
});

Router.post('/login', redirectIfLoggedIn, async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).send({ status: 'error', message: 'Email and password are required' });
        }
        const user = await User.findOne({ email }).exec();
        if (!user) {
            return res.status(401).send({ status: 'error', message: 'Invalid email or password' });
        }
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(401).send({ status: 'error', message: 'Invalid email or password' });
        }

        req.session.user = {
            id: user._id,
            name: user.name,
            email: user.email,
            type: user.type,
            username: user.username,
            password: {
                length: user.password.length,
                lastChanged: user.passwordLastChanged,
                default: user.isDefaultPassword
            }
        };

        res.status(200).send({ status: 'success', message: 'Logged in successfully' });
    } catch (err) {
        c.log('red', `[ERROR] ${err}`);
        res.status(500).send({ status: 'error', message: 'Internal Server Error' });
    }
});

Router.get('/logout', getLoginInformation, (req, res) => {
    if (req.session) {
        req.session.destroy(err => {
            if (err) {
                c.log('red', `[ERROR] ${err}`);
                return res.status(500).send({ status: 'error', message: 'Could not log out, try again' });
            }
            return res.status(200).send({ status: 'success', message: 'Logged out successfully' });
        });
    } else {
        return res.status(200).send({ status: 'success', message: 'Logged out successfully' });
    }
});

Router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        
        if (!email) {
            return res.status(400).send({ status: 'error', message: 'Email is required' });
        }

        const user = await User.findOne({ email }).exec();
        
        if (!user) {
            return res.status(200).send({ status: 'success', message: 'If the email exists, a password reset link has been sent' });
        }

        const resetToken = jwt.sign(
            { email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = new Date(Date.now() + 3600000); 
        await user.save();

        // await sendEmail(user.email, 'Password Reset', `Your reset token is: ${resetToken}`);

        res.status(200).send({ 
            status: 'success', 
            message: 'If the email exists, a password reset link has been sent',
            token: resetToken 
        });

    } catch (err) {
        c.log('red', `[ERROR] ${err}`);
        res.status(500).send({ status: 'error', message: 'Internal Server Error' });
    }
});

Router.post('/reset-password', async (req, res) => {
    try {
        const { newPassword, token } = req.body;
        
        if (!newPassword || !token) {
            return res.status(400).send({ status: 'error', message: 'New password and token are required' });
        }

        jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
            if (err) {
                return res.status(400).send({ status: 'error', message: 'Invalid or expired token' });
            }

            const email = decoded.email;
            const user = await User.findOne({ 
                email,
                resetPasswordToken: token,
                resetPasswordExpires: { $gt: Date.now() }
            }).exec();
            
            if (!user) {
                return res.status(400).send({ status: 'error', message: 'Invalid or expired password reset token' });
            }

            const hashedPassword = await bcrypt.hash(newPassword, 10);
            
            await User.findByIdAndUpdate(user._id, {
                password: hashedPassword,
                $unset: { resetPasswordToken: '', resetPasswordExpires: '' }
            });
            
            res.status(200).send({ status: 'success', message: 'Password has been reset successfully' });
        });

    } catch (err) {
        c.log('red', `[ERROR] ${err}`);
        res.status(500).send({ status: 'error', message: 'Internal Server Error' });
    }
});

/*
    User profile routes
*/

Router.get('/me', getLoginInformation, async (req, res) => {
    try {
        return res.status(200).send({ status: 'success', data: req.user });
    } catch (err) {
        c.log('red', `[ERROR] ${err}`);
        return res.status(500).send({ status: 'error', message: 'Internal Server Error' });
    }
});

Router.put('/me', getLoginInformation, async (req, res) => {
    try {
        const { name, username, email, password } = req.body;
        const user = await User.findById(req.user.id).exec();
        
        if (!user) {
            return res.status(404).send({ status: 'error', message: 'User not found' });
        }
        
        if (name) user.name = name;
        if (username) user.username = username;
        if (email) user.email = email;
        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            user.password = hashedPassword;
            user.isDefaultPassword = false;
            user.passwordLastChanged = new Date();
        }

        await user.save();

        if (req.session && req.session.user) {
            req.session.user.name = user.name;
            req.session.user.username = user.username;
        }

        return res.status(200).send({ status: 'success', message: 'User profile updated successfully' });

    } catch (err) {
        c.log('red', `[ERROR] ${err}`);
        return res.status(500).send({ status: 'error', message: 'Internal Server Error' });
    }
});

Router.delete('/me', getLoginInformation, async (req, res) => {
    try{
        await User.findByIdAndDelete(req.user.id).exec();
        
        if (req.session) {
            req.session.destroy();
        }
        return res.status(200).send({ status: 'success', message: 'User account deleted successfully' });
    } catch(err){
        c.log('red', `[ERROR] ${err}`);
        return res.status(500).send({ status: 'error', message: 'Internal Server Error' });
    }
});

module.exports = Router;
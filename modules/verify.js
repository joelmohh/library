const jwt = require('jsonwebtoken');

function getLoginInformation(req, res, next) {
    let user = null;
    if (req.session && req.session.user && req.session.user.id) {
        user = {
            id: req.session.user.id,
            name: req.session.user.name,
            email: req.session.user.email,
            type: req.session.user.type
        };
    }
    else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
        const token = req.headers.authorization.split(' ')[1];
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            user = {
                id: decoded.id,
                name: decoded.name,
                email: decoded.email,
                type: decoded.type
            };
        } catch (err) {
            user = null;
        }
    }

    if (user) {
        req.user = user; 
        return next();   
    } else {
        return res.status(401).send({ status: 'error', message: 'Unauthorized: No valid session or token found' });
    }
}

function redirectIfLoggedIn(req, res, next) {
    if (req.session && req.session.user) {
        if (req.session.user.type === 'admin') return res.redirect('/dashboard');
        if (req.session.user.type === 'student') return res.redirect('/student/home');
    }
    return next();
}

function isLoggedIn(req, res, next) {
    if (req.session && req.session.user) {
        return next();
    }
    return res.redirect('/auth/login');
}

function isAdmin(req, res, next) {
    const user = req.user || (req.session && req.session.user);
    if (user && user.type === 'admin') {
        return next();
    }
    return res.status(403).send({ status: 'error', message: 'Forbidden: Insufficient permissions' });
}

module.exports = {
    getLoginInformation, 
    redirectIfLoggedIn,
    isAdmin,
    isLoggedIn
};
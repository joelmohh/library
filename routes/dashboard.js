const Router = require('express').Router();
const c = require('@joelmo/console-color')();
const { isLoggedIn, isAdmin } = require('../modules/verify');

const Book = require('../models/Book');
const User = require('../models/User');
const Lending = require('../models/Lending');
const Action = require('../models/Actions');
const Category = require('../models/Categories');

Router.use(isLoggedIn, isAdmin, (req, res, next) => {
    const user = req.session.user;
    res.locals.currentUser = {
        ...user,
        password: {
            length: user.password.length,
            lastChanged: user.passwordLastChanged,
            default: user.isDefaultPassword
        }
    };
    next();
});

async function getDashboardStats(type) {
    const [books, students, lendingsCount] = await Promise.all([
        Book.find().limit(10).exec(),
        User.find({ type: type }).exec(),
        Lending.countDocuments({ returned: false }).exec()
    ]);

    return {
        books: { list: books, total: books.length + 1 },
        users: { list: students, total: students.length },
        lendingsTotal: lendingsCount
    };
}

Router.get('/', async (req, res) => {
    try {
        const stats = await getDashboardStats();
        const lendingsByDays = await Lending.aggregate([
            { $match: { returned: false } },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$lendDate" } },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]).exec();

        res.render('dashboard/index', {
            title: 'Admin Dashboard',
            currentPage: 'home',
            books: stats.books,
            users: stats.users,
            lendings: {
                total: stats.lendingsTotal,
                byDays: {
                    labels: lendingsByDays.map(i => i._id),
                    data: lendingsByDays.map(i => i.count)
                }
            }
        });
    } catch (err) {
        c.log('red', `[ERROR] ${err}`);
        res.status(500).send({ status: 'error', message: 'Internal Server Error' });
    }
});

Router.get('/users/:id', async (req, res) => {
    try {
        const stats = await getDashboardStats(req.params.id);
        res.render('dashboard/users', {
            ...stats,
            lendings: { total: stats.lendingsTotal },
            currentPage: 'users',
            title: 'Users',
            page: req.params.id
        });
    } catch (err) {
        c.log('red', `[ERROR] ${err}`);
        res.status(500).send({ status: 'error', message: 'Internal Server Error' });
    }
});

Router.get('/books', async (req, res) => {
    try {
        const [books, students] = await Promise.all([
            Book.find().exec(),
            User.find({ type: 'student' }).exec()
        ]);

        res.render('dashboard/books', {
            currentPage: 'books',
            title: 'Books',
            books: { list: books, total: books.length },
            users: { list: students, total: students.length }
        });
    } catch (err) {
        c.log('red', `[ERROR] ${err}`);
        res.status(500).send({ status: 'error', message: 'Internal Server Error' });
    }
});

Router.get('/lendings', async (req, res) => {
    try {
        const [lendings, books, users] = await Promise.all([
            Lending.find().exec(),
            Book.find({ disponible: true }).exec(),
            User.find({ type: 'student' }).exec()
        ]);

        const loans = await Promise.all(
            lendings
                .filter(lending => !lending.returned)
                .map(async lending => {
                    const book = await Book.findById(lending.bookId).exec()
                    const user = await User.findById(lending.userId).exec();
                    return {
                        id: lending._id,
                        book: {
                            id: book._id,
                            title: book.title
                        },
                        user: {
                            id: user._id,
                            name: user.name
                        },
                        lendDate: lending.lendDate,
                        returnDate: lending.returnDate,
                        returned: lending.returned
                    };
                })
        );
        res.render('dashboard/lendings', {
            currentPage: 'lendings',
            title: 'Lendings',
            lendings: { list: loans, total: loans.length },
            books: { list: books, total: books.length },
            users: { list: users, total: users.length }
        });
    } catch (err) {
        c.log('red', `[ERROR] ${err}`);
        res.status(500).send({ status: 'error', message: 'Internal Server Error' });
    }
});

Router.get('/settings', (req, res) => {
    res.render('settings/index', {
        currentPage: 'settings',
        title: 'Settings'
    });
});

Router.get('/actions', async (req, res) => {
    try {
        const stats = await getDashboardStats(req.params.id);
        const actions = await Action.find().sort({ createdAt: -1 }).limit(100).exec();
        res.render('dashboard/actions', {
            stats,
            currentPage: 'actions',
            title: 'Actions Log',
            actions: { list: actions, total: actions.length }
        });
    } catch (err) {
        c.log('red', `[ERROR] ${err}`);
        res.status(500).send({ status: 'error', message: 'Internal Server Error' });
    }
});
Router.get('/categories', async (req, res) => {
    try {
        const [lendings, books, users] = await Promise.all([
            Lending.find().populate('bookId userId').exec(),
            Book.find().exec(),
            User.find({ type: 'student' }).exec()
        ]);

        res.render('dashboard/categories', {
            currentPage: 'categories',
            title: 'Categories',
            categories: { list: await Category.find().exec(), total: (await Category.find().exec()).length },
            lendings: { list: lendings, total: lendings.length },
            books: { list: books, total: books.length },
            users: { list: users, total: users.length }
        });
    } catch (err) {
        c.log('red', `[ERROR] ${err}`);
        res.status(500).send({ status: 'error', message: 'Internal Server Error' });
    }
});

module.exports = Router;
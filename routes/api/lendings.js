const Router = require('express').Router();
const c = require('@joelmo/console-color')();
const Lending = require('../../models/Lending');
const Books = require('../../models/Book');
const { getLoginInformation, isAdmin} = require('../../modules/verify');

Router.post('/create', getLoginInformation, isAdmin, async (req, res) => {
    try {
        const { bookId, userId } = req.body;
        c.log('green', `[LENDING CREATE] Book ID: ${bookId}, User ID: ${userId}`);

        if (!bookId || !userId) {
            return res.status(400).send({ status: 'error', message: 'Missing required fields' });
        }

        const newLending = new Lending({
            bookId: bookId,
            userId: userId,
            lendDate: new Date(),
            returned: false,
            createdBy: req.user.id,
            returnDate: req.body.returnDate ? new Date(req.body.returnDate) : null
        });
        await Books.findByIdAndUpdate(bookId, { disponible: false });
        await newLending.save();
        return res.status(201).send({ status: 'success', message: 'Lending created successfully' });

    } catch (err) {
        c.log('red', `[ERROR] ${err}`);
        return res.status(500).send({ status: 'error', message: 'Internal Server Error' });
    }
});

Router.post('/return', getLoginInformation, isAdmin, async (req, res) => {
    try {
        const { lendingId } = req.body;

        if (!lendingId) {
            return res.status(400).send({ status: 'error', message: 'Missing required fields' });
        }

        const lending = await Lending.findById(lendingId);

        if (!lending) {
            return res.status(404).send({ status: 'error', message: 'Lending not found' });
        }

        if (lending.returned) {
            return res.status(400).send({ status: 'error', message: 'Lending already returned' });
        }

        lending.returned = true;
        lending.returnedAt = new Date();
        lending.returnedBy = req.user.id;

        await lending.save();
        await Books.findByIdAndUpdate(lending.bookId, { disponible: true });

        return res.status(200).send({ status: 'success', message: 'Lending returned successfully' });

    } catch (err) {
        c.log('red', `[ERROR] ${err}`);
        return res.status(500).send({ status: 'error', message: 'Internal Server Error' });
    }
});

Router.put('/extend', getLoginInformation, isAdmin, async (req, res) => {
    try {
        const { lendingId, newReturnDate } = req.body;
        if (!lendingId || !newReturnDate) {
            return res.status(400).send({ status: 'error', message: 'Missing required fields' });
        }
        const lending = await Lending.findById(lendingId);
        if (!lending) {
            return res.status(404).send({ status: 'error', message: 'Lending not found' });
        }
        if (lending.returned) {
            return res.status(400).send({ status: 'error', message: 'Cannot extend a returned lending' });
        }

        lending.returnDate = new Date(newReturnDate);
        await lending.save();

        return res.status(200).send({ status: 'success', message: 'Lending return date extended successfully' });

    } catch (err) {
        c.log('red', `[ERROR] ${err}`);
        return res.status(500).send({ status: 'error', message: 'Internal Server Error' });
    }
});

Router.delete('/delete', getLoginInformation, isAdmin, async (req, res) => {
    try {
        const { lendingId } = req.body;
        if (!lendingId) {
            return res.status(400).send({ status: 'error', message: 'Missing required fields' });
        }
        const lending = await Lending.findByIdAndDelete(lendingId);
        if (!lending) {
            return res.status(404).send({ status: 'error', message: 'Lending not found' });
        }
        await Books.findByIdAndUpdate(lending.bookId, { disponible: true });
        return res.status(200).send({ status: 'success', message: 'Lending deleted successfully' })
    } catch (err) {
        c.log('red', `[ERROR] ${err}`);
        return res.status(500).send({ status: 'error', message: 'Internal Server Error' });
    }
});

Router.get('/list', getLoginInformation, isAdmin, async (req, res) => {
    try {
        const lendings = await Lending.find().populate('bookId userId').exec();
        return res.status(200).send({ status: 'success', data: lendings });

    } catch (err) {
        c.log('red', `[ERROR] ${err}`);
        return res.status(500).send({ status: 'error', message: 'Internal Server Error' });
    }
});
Router.get('/list/:number/:page', getLoginInformation, isAdmin, async (req, res) => {
    try {
        const number = parseInt(req.params.number) || 10;
        const page = parseInt(req.params.page) || 1;
        const skip = (page - 1) * number;
        const lendings = await Lending.find().populate('bookId userId').skip(skip).limit(number).exec();
        const total = await Lending.countDocuments().exec();
        return res.status(200).send({ status: 'success', data: lendings, total });
    } catch (err) {
        c.log('red', `[ERROR] ${err}`);
        return res.status(500).send({ status: 'error', message: 'Internal Server Error' });
    }
});

module.exports = Router;
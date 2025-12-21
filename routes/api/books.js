const Router = require('express').Router();
const c = require('@joelmo/console-color')();

const Book = require('../../models/Book');
const { isAdmin, getLoginInformation } = require('../../modules/verify');

Router.get('/all/:number/:page', async (req, res) => {
    try {
        const number = parseInt(req.params.number);
        const page = parseInt(req.params.page);
        if (isNaN(number) || isNaN(page) || number <= 0 || page < 0) {
            return res.status(400).send({ status: 'error', message: 'Invalid pagination parameters' });
        }
        const books = await Book.find().skip(page * number).limit(number).exec();
        return res.status(200).send({ status: 'success', data: books });
    } catch (err) {
        c.log('red', `[ERROR] ${err}`);
        return res.status(500).send({ status: 'error', message: 'Internal Server Error' });
    }
});
Router.get('/search', async (req, res) => {
    try {
        const { query } = req.query;
        if (!query) {
            return res.status(400).send({ status: 'error', message: 'Missing search query' });
        }
        const books = await Book.find({
            $or: [
                { title: { $regex: query, $options: 'i' } },
                { author: { $regex: query, $options: 'i' } }
            ]
        }).exec();
        return res.status(200).send({ status: 'success', data: books });
    } catch (err) {
        c.log('red', `[ERROR] ${err}`);
        return res.status(500).send({ status: 'error', message: 'Internal Server Error' });
    }
});
Router.get('/:id', async (req, res) => {
    try {
        const bookId = req.params.id;
        if(!bookId) {
            return res.status(400).send({ status: 'error', message: 'Missing book ID' });
        }
        const book = await Book.findById(bookId).exec();
        if (!book) {
            return res.status(404).send({ status: 'error', message: 'Book not found' });
        }
        return res.status(200).send({ status: 'success', data: book });
    } catch (err) {
        c.log('red', `[ERROR] ${err}`);
        return res.status(500).send({ status: 'error', message: 'Internal Server Error' });
    }
});
Router.get('/search/:category/:number/:page', async (req, res) => {
    try {
        const category = req.params.category;
        const page = parseInt(req.params.page);
        const number = parseInt(req.params.number);
        if (isNaN(page) || isNaN(number) || number <= 0 || page < 0) {
            return res.status(400).send({ status: 'error', message: 'Invalid pagination parameters' });
        }
        const books = await Book.find({ category }).skip(page * number).limit(number).exec();
        return res.status(200).send({ status: 'success', data: books });
    } catch (err) {
        c.log('red', `[ERROR] ${err}`);
        return res.status(500).send({ status: 'error', message: 'Internal Server Error' });
    }
});
Router.post('/add', getLoginInformation, isAdmin, async (req, res) => {
    try {
        const { title, author, isbn, category } = req.body;
        if (!title || !author || !isbn || !category) {
            return res.status(400).send({ status: 'error', message: 'Missing required fields' });
        }
        const newBook = new Book({
            title,
            author,
            isbn,
            category
        });
        await newBook.save();
        return res.status(201).send({ status: 'success', message: 'Book added successfully' });
    } catch (err) {
        c.log('red', `[ERROR] ${err}`);
        return res.status(500).send({ status: 'error', message: 'Internal Server Error' });
    }
});
Router.put('/update', getLoginInformation, isAdmin, async (req, res) => {
    try {
        const { bookId, title, author, isbn, category } = req.body;
        if (!bookId || !title || !author || !isbn || !category) {
            return res.status(400).send({ status: 'error', message: 'Missing required fields' });
        }
        const book = await Book.findById(bookId);
        if (!book) {
            return res.status(404).send({ status: 'error', message: 'Book not found' });
        }
        book.title = title;
        book.author = author;
        book.isbn = isbn;
        book.category = category;
        await book.save();
        return res.status(200).send({ status: 'success', message: 'Book updated successfully' });
    } catch (err) {
        c.log('red', `[ERROR] ${err}`);
        return res.status(500).send({ status: 'error', message: 'Internal Server Error' });
    }
});
Router.delete('/delete', getLoginInformation, isAdmin, async (req, res) => {
    try {
        const { bookId } = req.body;
        if (!bookId) {
            return res.status(400).send({ status: 'error', message: 'Missing required fields' });
        }   
        const book = await Book.findById(bookId);
        if (!book) {
            return res.status(404).send({ status: 'error', message: 'Book not found' });
        }
        await Book.deleteOne({ _id: bookId });
        return res.status(200).send({ status: 'success', message: 'Book deleted successfully' });
    } catch (err) {
        c.log('red', `[ERROR] ${err}`);
        return res.status(500).send({ status: 'error', message: 'Internal Server Error' });
    }
});
module.exports = Router;
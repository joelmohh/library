const Router = require('express').Router();
const c = require('@joelmo/console-color')();

const Book = require('../../models/Book');
const { isAdmin, getLoginInformation } = require('../../modules/verify');
const { validateISBN } = require('../../modules/isbnValidator');

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
        
        if (!validateISBN(isbn)) {
            return res.status(400).send({ status: 'error', message: 'Invalid ISBN format' });
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
        
        if (!validateISBN(isbn)) {
            return res.status(400).send({ status: 'error', message: 'Invalid ISBN format' });
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

Router.get('/google-books/:isbn', async (req, res) => {
    try {
        const isbn = req.params.isbn;
        if (!isbn) {
            return res.status(400).send({ status: 'error', message: 'ISBN is required' });
        }

        const https = require('https');
        const url = `https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}`;

        https.get(url, (apiRes) => {
            let data = '';

            apiRes.on('data', (chunk) => {
                data += chunk;
            });

            apiRes.on('end', () => {
                try {
                    const response = JSON.parse(data);
                    
                    if (response.totalItems === 0) {
                        return res.status(404).send({ 
                            status: 'error', 
                            message: 'No book found with this ISBN' 
                        });
                    }

                    const bookInfo = response.items[0].volumeInfo;
                    
                    const bookData = {
                        title: bookInfo.title || '',
                        author: bookInfo.authors ? bookInfo.authors.join(', ') : '',
                        category: bookInfo.categories ? bookInfo.categories[0] : '',
                        publisher: bookInfo.publisher || '',
                        publishedDate: bookInfo.publishedDate || '',
                        description: bookInfo.description || '',
                        pageCount: bookInfo.pageCount || 0,
                        language: bookInfo.language || '',
                        thumbnail: bookInfo.imageLinks ? bookInfo.imageLinks.thumbnail : ''
                    };

                    return res.status(200).send({ 
                        status: 'success', 
                        data: bookData 
                    });
                } catch (parseError) {
                    c.log('red', `[ERROR] Parsing Google Books API response: ${parseError}`);
                    return res.status(500).send({ 
                        status: 'error', 
                        message: 'Error parsing book data' 
                    });
                }
            });
        }).on('error', (err) => {
            c.log('red', `[ERROR] Google Books API request: ${err}`);
            return res.status(500).send({ 
                status: 'error', 
                message: 'Error fetching book data from Google Books' 
            });
        });
    } catch (err) {
        c.log('red', `[ERROR] ${err}`);
        return res.status(500).send({ status: 'error', message: 'Internal Server Error' });
    }
});

module.exports = Router;
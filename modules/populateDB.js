const c = require('@joelmo/console-color')();
const mongoose = require('mongoose');
const User = require('../models/User');
const Book = require('../models/Book');
const Lending = require('../models/Lending');
const bcrypt = require('bcrypt');
require('dotenv').config();

async function populateDB() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        c.log('green', 'Connected to MongoDB');
        await User.deleteMany({});
        await Book.deleteMany({});
        await Lending.deleteMany({});
        c.log('yellow', 'Cleared existing data');
        const users = [
            {
                name: 'Admin User',
                email: process.env.ADMIN_EMAIL,
                password: bcrypt.hashSync(process.env.ADMIN_PASSWORD, 10),
                username: 'adminuser',
                type: 'admin'
            },
            { name: 'Regular User', email: process.env.REGULAR_USER_EMAIL, password: bcrypt.hashSync(process.env.REGULAR_USER_PASSWORD, 10), username: 'regularuser', type: 'student' },
        ];
        for (const userData of users) {
            const user = new User(userData);
            await user.save();
        }
        c.log('green', 'Populated Users');
        const books = [ 
            { title: '1984', category: 'Fiction', author: 'George Orwell', isbn: '9780451524935' },
            { title: 'To Kill a Mockingbird', category: 'Fiction', author: 'Harper Lee', isbn: '9780060935467' },
            { title: 'A Brief History of Time', category: 'Science', author: 'Stephen Hawking', isbn: '9780553380163' },
            { title: 'The Great Gatsby', category: 'Fiction', author: 'F. Scott Fitzgerald', isbn: '9780743273565' },
            { title: 'The Art of Computer Programming', category: 'Technology', author: 'Donald Knuth', isbn: '9780201896831' },
            { title: 'Clean Code', category: 'Technology', author: 'Robert C. Martin', isbn: '9780132350884' },
            { title: 'The Pragmatic Programmer', category: 'Technology', author: 'Andrew Hunt and David Thomas', isbn: '9780201616224' },
            { title: 'Introduction to Algorithms', category: 'Technology', author: 'Thomas H. Cormen', isbn: '9780262033848' },
            { title: 'Design Patterns', category: 'Technology', author: 'Erich Gamma et al.', isbn: '9780201633610' },
        ];
        for (const bookData of books) {
            const book = new Book(bookData);
            await book.save();
        }
        c.log('green', 'Populated Books');
    } catch (err) {
        c.log('red', `Error populating database: ${err}`);
        process.exit(1);
    }
}

populateDB();
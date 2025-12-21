const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const BookSchema = new Schema({
    title: { type: String, required: true },
    category: { type: String, required: true },
    author: { type: String, required: true },
    isbn: { type: String, required: true },
    disponible:{ type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Book', BookSchema);
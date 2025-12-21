const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ActionSchema = new Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    author: { type: String, required: true },
    date: { type: Date, default: Date.now }
}, { timestamps: true });
module.exports = mongoose.model('Action', ActionSchema);
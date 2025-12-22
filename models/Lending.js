const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const LendingSchema = new Schema({
    bookId: { type: Schema.Types.ObjectId, ref: 'Book', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    lendDate: { type: Date, required: true },
    returnDate: { type: Date },
    returned: { type: Boolean, default: false },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    returnedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    returnedAt: { type: Date },
    overdueNotificationSent: { type: Boolean, default: false },
    reminderNotificationSent: { type: Boolean, default: false },
    lastNotificationDate: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('Lending', LendingSchema);
// KhataAI — Transaction Model
// 📚 Sr.No.18 - Sharding: shopId se sirf apna data

const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    shopId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    customerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer',
        required: true
    },
    type: {
        type: String,
        enum: ['credit', 'collection'],
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    description: {
        type: String,
        default: ''
    },
    transcription: {
        type: String,
        default: ''
    },
    source: {
        type: String,
        enum: ['whatsapp', 'manual','voice'],
        default: 'manual'
    }
}, { timestamps: true });

module.exports = mongoose.model('Transaction', transactionSchema);
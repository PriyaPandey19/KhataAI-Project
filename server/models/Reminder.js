





const mongoose = require('mongoose');
//reminder schema

const reminderSchema = new mongoose.Schema({
    shopId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    customerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref:'Customer',
        required: true
    },
    transactionId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Transaction'
    },
    amount: {
        type: Number,
        required: true
    },
    message: {
        type: String,
        default:''
    },
    channel:{
        type: String,
        enum: ['whatsapp','sms'],
        default: 'whatsapp'
    },
    status: {
        type: String,
        enum:['pending','sent','failed','cancelled'],
        default: 'pending'
    },
    scheduledAt: {
        type: Date,
        required: true
    },
    sentAt: {
        type: Date
    },
    retryCount: {
        type: Number,
        default: 0
    }
}, {timestamps: true});


reminderSchema.index({shopId: 1});
reminderSchema.index({status: 1, scheduledAt: 1});

module.exports = mongoose.model('Reminder',reminderSchema)
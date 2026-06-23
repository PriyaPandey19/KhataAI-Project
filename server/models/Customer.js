const mongoose = require('mongoose')

//customer schema

const customerSchema = new mongoose.Schema({
    //sharding and partitioning all queries filetr by shopId
    shopId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name:{
        type: String,
        required: true
    },
    phone: {
        type:String
    },
    totalBalance:{
        type: Number,
        default: 0
    },
    //this field is updated by our ml model predict the score
    riskScore:{
        type: String,
        enum: ['low','medium','high'],
        default: 'low'
    },
    lastTransactions: {
       type: Number,
       default: 0
    },
    promisedDate: {
        type: Date
    }

}, {timestamps: true});


customerSchema.index({shopId: 1});
customerSchema.index({shopId: 1, name: 1});

module.exports = mongoose.model('Customer', customerSchema);
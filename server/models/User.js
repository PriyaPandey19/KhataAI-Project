//imports are required


const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

//schema define owner details
const userSchema = new mongoose.Schema({
    shopName: {
        type: String,
        required: true
    },
    ownerName: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        unique: true,
        sparse: true
    },
    password: {
        type: String,
        required: true
    },
    whatsappNumber: {
        type: String,
        unique: true,
        sparse: true
    },
    plan: {
        type: String,
        enum: ['free','pro','business'],
        default: 'free'
    }
},{timestamps: true});


userSchema.pre('save', async function(next){
    if(!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.matchPassword = async function(enteredPassword){
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);

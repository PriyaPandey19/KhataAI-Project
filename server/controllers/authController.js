//concept jwt authentication

const jwt = require('jsonwebtoken')
const {validationResult} = require('express-validator');
const User = require('../models/User');

//jwt token jo frontend localstorage mein store hota hai
//har API request mein Authorization header mein bheja jata hai
const generateToken = (id) => {
    return jwt.sign({id}, process.env.JWT_SECRET, {expiresIn: '30d'})
};

//new shopkeeper register karta  hai
exports.register = async(req, res, next)=> {
    try{
        //express-validator se check karo ki sab field sahi hai
        const errors = validationResult(req);
        if(!errors.isEmpty()){
            return res.status(400).json({errors: errors.array()});
        }

        const {shopName, ownerName, phone, email, password} = req.body;

        //duplicate phone check - ek number pe ek hi account
        const existingUser = await User.findOne({phone});
        if(existingUser){
            return res.status(400).json({message: "Phone already registered"});
        }

        //user create -> password automatically hash hoga user.js pre save hook se
        const user = await User.create({shopName, ownerName, phone, email, password});

        //token ke sath response bhejo takki frontend turant login ho jaye
        res.status(201).json({
            success: true,
            token: generateToken(user._id),
            user: {
                id: user._id,
                shopName: user.shopName,
                ownerName: user.ownerName,
                phone: user.phone,
                plan: user.plan
            }
        });


    }catch(err){
        next(err);
    }
}

//exsiting shopkeeper login karta hai
exports.login= async(req,res,next) => {
    try{
        const errors = validationResult(req);
        if(!errors.isEmpty()){
            return res.status(400).json({errors: error.array()});
        }

        const {phone, password} = req.body;
        const user = await User.findOne({phone}).select('+password');
        if(!user){
            return res.status(401).json({message: 'Invalid phone or password'});
        }

        //user.js ka matchpassword method use karo
        //bcrpypt.compare internally hota hai
        const isMatch = await user.matchPassword(password);
        if(!isMatch){
            return res.status(401).json({message: 'Invalid phone or password'});
        }

        res.json({
            success: true,
            token: generateToken(user._id),
            user: {
                id: user._id,
                shopName: user.shopName,
                ownerName: user.ownerName,
                phone: user.phone,
                plan: user.plan
            }
        });

    }catch(err){
        next(err);
    }
}

//frontend page relaoad pe logged in user ki info fetch karta hai
exports.getMe = async(req,res,next) => {
    try{
   const user = await User.findById(req.user.id);
   res.json({success: true ,user});
    }catch(err){
        next(err);
    }
}
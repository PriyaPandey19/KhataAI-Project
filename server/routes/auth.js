const express = require('express');
const router = express.Router();
const {register, login, getMe } = require('../controllers/authController');
const protect = require('../middleware/auth');
const {body} = require('express-validator');

//validation rules fro register
const registerRules = [
  body('shopName').notEmpty().withMessage('Shop name required'),
  body('ownerName').notEmpty().withMessage('Owner name required'),
  body('phone').notEmpty().withMessage('Phone Required'),
  body('password').isLength({min: 6}).withMessage('Password min 6 characters')
];

//validation rules for login
const loginRules = [
  body('phone').notEmpty().withMessage('Phone required'),
  body('password').notEmpty().withMessage('Password required')
];

//naya shopkeeper register karo
router.post('/register', registerRules,register);

//existing shop login
router.post('/login', loginRules, login)

//logged in user ki info
router.get('/me', protect,getMe);






module.exports = router;
const express = require('express');
const router = express.Router();
const {webhook, sendDailySummary} = require('../controllers/whatsappController');
const protect = require('../middleware/auth');
const rateLimit = require('express-rate-limit');

//webhook pe rate limt - spam se bacho
//100 requests per 15 minutes allowed
const webhookLimiter = rateLimit({
windowMs: 15 * 60 * 1000,
max: 100,
message: 'Too many requests'
});

//twilio yahan message bhejta hai  public route no auth needed
//twilio ka apna verification hota hai
router.post('/webhook',webhookLimiter, webhook);

//cron job ya manully trigger - auth required
router.post('/daily-summary',protect,sendDailySummary);


module.exports = router;
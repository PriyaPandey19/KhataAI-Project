const express = require('express');
const router  = express.Router();
const protect = require('../middleware/auth');
const { getSmartInsight } = require('../controllers/aiController');

router.get('/smart-insight', protect, getSmartInsight);

module.exports = router;
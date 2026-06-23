const express = require('express');
const router  = express.Router();
const protect = require('../middleware/auth');
const { processVoiceEntry } = require('../controllers/voiceController');

router.post('/process', protect, processVoiceEntry);

module.exports = router;
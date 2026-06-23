const express = require('express');
const router = express.Router();
const {
  getSummary,
  getWeeklyTrend,
  getMonthlyTrend,
  getTopCustomers,
  getRiskReport,
  getSmartInsight
} = require('../controllers/analyticsController');
const protect = require('../middleware/auth');

//saare analytics routes protected hain
router.use(protect);

//get - dashbaord ka main data
router.get('/summary',getSummary);

//get - last 7 days chart data
router.get('/weekly',getWeeklyTrend);

//monthly chart data
router.get('/monthly',getMonthlyTrend);

//get - best aur worsr paying
router.get('/top-customers',getTopCustomers);

router.get('/risk-report', getRiskReport);
router.get('/smart-insight', getSmartInsight);

module.exports = router;
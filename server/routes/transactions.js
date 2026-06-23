const express = require('express');
const router = express.Router();
const {
  addTransaction,
  getTransactions,
  deleteTransaction
} = require('../controllers/transactionController');
const protect = require('../middleware/auth');

//sare transaction routes protected ain
router.use(protect);

//get - list with filters
//post - naya transaction add
router.route('/')
.get(getTransactions)
.post(addTransaction);

//transaction delete + balance reverse
router.route('/:id').delete(deleteTransaction);



module.exports = router;
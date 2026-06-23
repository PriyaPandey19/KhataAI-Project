const express = require('express');
const router = express.Router();
const {
  addCustomer,
  getCustomers,
  getCustomer,
  updateCustomer,
  deleteCustomer
} = require('../controllers/customerController');
const protect = require('../middleware/auth');

//sare customer routes protected hain - login required\
router.use(protect);

//get sare customer list
//post naya customer add
router.route('/')
.get(getCustomers)
.post(addCustomer);

//get - ek customer ki detail
//put customer update
//delete - customer delete

router.route('/:id')
.get(getCustomer)
.put(updateCustomer)
.delete(deleteCustomer);

module.exports = router;
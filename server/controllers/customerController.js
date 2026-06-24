const mongoose = require('mongoose');
const Customer = require('../models/Customer');
const Transaction = require('../models/Transaction');

// ─── ADD CUSTOMER ────────────────────────────────────────────────────────────
exports.addCustomer = async (req, res, next) => {
    try {
        const { name, phone,totalBalance } = req.body;

        const customer = await Customer.create({
            shopId: req.user._id,   // consistent: always _id
            name,
            phone,
            totalBalance: totalBalance || 0
        });

        res.status(201).json({ success: true, customer });

    } catch (err) {
        next(err);
    }
};

// ─── GET ALL CUSTOMERS ───────────────────────────────────────────────────────
exports.getCustomers = async (req, res, next) => {
    try {
        const { search, risk, page = 1, limit = 20 } = req.query;

        // FIX 1: Don't manually construct ObjectId — Mongoose handles it
        const query = { shopId: req.user._id };

        if (search) {
            query.$or = [
                { name:  { $regex: search, $options: 'i' } },
                { phone: { $regex: search, $options: 'i' } }
            ];
        }

        // FIX 2: Frontend sends 'high'/'medium'/'low' — matches riskScore enum correctly
        // But filter key from frontend is 'risk', stored field is 'riskScore'
        if (risk && risk !== 'all') query.riskScore = risk;

        const customers = await Customer.find(query)
            .sort({ createdAt: -1 })   // FIX 3: sort by newest first, not balance (shows newly added customers)
            .skip((page - 1) * limit)
            .limit(Number(limit));

        const total = await Customer.countDocuments(query);

        res.json({
            success: true,
            customers,
            pagination: { page: Number(page), limit: Number(limit), total }
        });

    } catch (err) {
        next(err);
    }
};

// ─── GET ONE CUSTOMER ────────────────────────────────────────────────────────
exports.getCustomer = async (req, res, next) => {
    try {
        // FIX 4: consistent req.user._id everywhere (not req.user.id)
        const customer = await Customer.findOne({
            _id: req.params.id,
            shopId: req.user._id   // ← was req.user.id (bug)
        });

        if (!customer) {
            return res.status(404).json({ message: 'Customer not found' });
        }

        const transactions = await Transaction.find({
            shopId: req.user._id,      // ← was req.user.id (bug)
            customerId: customer._id
        })
            .sort({ createdAt: -1 })
            .limit(10);

        res.json({ success: true, customer, transactions });

    } catch (err) {
        next(err);
    }
};

// ─── UPDATE CUSTOMER ─────────────────────────────────────────────────────────
exports.updateCustomer = async (req, res, next) => {
    try {
        // FIX 5: findOneAndUpdate instead of findByIdAndUpdate with object filter
        // findByIdAndUpdate only takes an id as first arg, not an object
        const customer = await Customer.findOneAndUpdate(
            { _id: req.params.id, shopId: req.user._id },  // ← was req.user.id (bug)
            req.body,
            { new: true, runValidators: true }
        );

        if (!customer) {
            return res.status(404).json({ message: 'Customer not found' });
        }

        res.json({ success: true, customer });

    } catch (err) {
        next(err);
    }
};

// ─── DELETE CUSTOMER ─────────────────────────────────────────────────────────
exports.deleteCustomer = async (req, res, next) => {
    try {
        // FIX 6: findOneAndDelete instead of findByIdAndDelete with object filter
        const customer = await Customer.findOneAndDelete({
            _id: req.params.id,
            shopId: req.user._id   // ← was req.user.id (bug)
        });

        if (!customer) {
            return res.status(404).json({ message: 'Customer not found' });
        }

        res.json({ success: true, message: 'Customer deleted' });

    } catch (err) {
        next(err);
    }
};
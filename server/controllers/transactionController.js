const mongoose = require('mongoose');
const Transaction = require('../models/Transaction')
const Customer = require('../models/Customer');

//dashboard se manually transaction add karta hai
//whatsapp se aane wale transaction whatsappcontroller mein handle hota hai
exports.addTransaction = async(req, res, next) => {
    try{
        const {customerId, type, amount, description} = req.body;

        //phele verify karo customer is shop ka hai
        const customer = await Customer.findOne({
            _id: customerId,
            shopId: req.user._id
        });

        if(!customer){
            return res.status(404).json({message: 'Customer not found'});
        }

        //transaction save karo
        const transaction = await Transaction.create({
            shopId: req.user._id,
            customerId,
            type,
            amount,
            description,
            source: 'manual'
        });


        //customer ka balance update karo
        //credit = customer pe aur baki badha(positive)
        //payment = customer ne diya, bakki ghata(negative)
        const balanceChange = type === 'credit' ? amount : -amount;

        await Customer.findByIdAndUpdate(customerId, {
          $inc: { totalBalance: balanceChange },
          lastTransactions: amount  
        });

        //dashboard ko real time update bhejo bina page reload ke
        const io = req.app.get('io');
        io.emit('newTransaction', {
            shopId: req.user.id,
            transaction,
            customerName: customer.name
        });

        res.status(201).json({success: true, transaction})

    }catch(err){
        next(err);
    }
}

//transaction page pe list - filter by customer,type, date
exports.getTransactions = async(req,res, next) => {
    try{
        const {customerId, type, page =1,limit = 20, startDate, endDate} = req.query;

         const shopId = new mongoose.Types.ObjectId(req.user._id);
        const query = {shopId: req.user.id};


        //optional filter
        if(customerId) query.customerId = customerId;
        if(type) query.type = type;

        //date range filter for exports feature
        if(startDate || endDate){
            query.createdAt = {};
            if(startDate) query.createdAt.$gte = new Date(startDate);
            if(endDate) query.createdAt.$lte = new Date(endDate);
        }

        //populate = customer ka name aur phone bhi sath mein aayenge
        const transactions = await Transaction.find(query)
        .populate('customerId', 'name phone')
        .sort({createdAt: -1})
        .skip((page - 1)* limit)
        .limit(Number(limit));

        const total = await Transaction.countDocuments(query);

        res.json({
            success: true,
            transactions,
            pagination: {page: Number(page), limit: Number(limit), total}
        });


    }catch(err){
        next(err);
    }
}

//galat entry delete karna - balance bhi reverse hoga
exports.deleteTransaction = async(req, res, next) => {
    try{
      const transaction = await Transaction.findOne({
        _id: req.params.id,
        shopId: req.user.id
      });

      if(!transaction){
        return res.status(404).json({message: 'Transaction not found'});
      }

      //balance reverse karo
      //agar credit tha to balance ghata do
      //agar payment tha toh balance badha do
      const balanceChange = transaction.type ==='credit'
      ? -transaction.amount
      : transaction.amount;

      await Customer.findByIdAndUpdate(transaction.customerId, {
        $inc: { totalBalance: balanceChange}
      });

      await transaction.deleteOne();
      res.json({success: true, message: 'Transaction deleted'});
    }catch(err){
        next(err);
    }
}
//shardning and partioning
const mongoose = require('mongoose');
const Transaction = require('../models/Transaction');
const Customer = require('../models/Customer');
const axios = require('axios');



//get summary => called when dashboard loads credit, coleection etc
exports.getSummary = async(req,res,next) => {
    try{
        const shopId = new mongoose.Types.ObjectId(req.user._id);

        const todayStart = new Date();
        todayStart.setHours(0,0,0,0);

        //promise.all = sare queries ek sath chalti hain
        //API parallel execution

        const [todayTransactions, totalCustomers, topRisky] = await Promise.all([
          //aaj ki sari transaction
          Transaction.find({shopId, createdAt: {$gte: todayStart}}),

          //total customers in shop
          Customer.countDocuments({shopId}),

          //high risk customer

          Customer.find({shopId, riskScore: 'high'})
            .sort({totalBalance: -1})
            .limit(5)
            .select('name phone totalBalance riskScore')


        ]);

        //credit aur payment alag alag calculate karo
        let todayCredit = 0;
        let todayCollection = 0;

        todayTransactions.forEach(t => {
            if(t.type ==='credit') todayCredit += t.amount;
            else todayCollection += t.amount;
        });

        //saare customers ka total outstanding balance
        const outstandingResult = await Customer.aggregate([
          { $match: { shopId } },
          { $group: { _id: null, total: { $sum: '$totalBalance' } } }  
        ]);


        const totalOutstanding = outstandingResult[0]?.total || 0;
        res.json({
            success: true,
            data :{
                todayCredit,
                todayCollection,
                todayNet: todayCredit - todayCollection,
                totalOutstanding,
                totalCustomers,
                topRiskyCustomers: topRisky
            }
        });
    }catch(err){
        next(err);
    }
};

//getweeklyTrend -> called on dashboard chart
//return last 7 day credit vs payment data for rechart
exports.getWeeklyTrend = async(req, res,next) => {
try{
    const shopId = new mongoose.Types.ObjectId(req.user._id);

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 30);

    //aggregate pipeline
    //step 1 - filter byshopId and last 7 days
    //step 2 - group by date + type, sum amounts
    //step 3 - sort by date ascending for charts
    const transactions = await Transaction.aggregate([
       { $match: { shopId, createdAt: { $gte: sevenDaysAgo } } },
       {
         $group: {
            _id: {
                date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                        type: '$type' 
            },
            total: { $sum: '$amount' }
       }  
    },
    { $sort: { '_id.date': 1 } }
    ]);
    res.json({success: true, data: transactions});
}catch(err){
    next(err);
}
};


//getMonthlyTrend -> called on analytics page
//return month wise credit vs collection for yearly comparison
exports.getMonthlyTrend = async(req, res, next) => {
    try{
       const shopId = new mongoose.Types.ObjectId(req.user._id);

       const transactions = await Transaction.aggregate([
         { $match: { shopId } },
         {
           $group: { 
              _id: { 
                 month: { $month: '$createdAt' },
                        year: { $year: '$createdAt' },
                        type: '$type'
              },
               total: { $sum: '$amount' }   
         }
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } }
       ]);
         res.json({ success: true, data: transactions });

    }catch(err){
        next(err);
    }
};


//getTopCustomer -> called on analytics page
//return best paying and more paying customers
exports.getTopCustomers = async (req, res, next) => {
    try {
        const shopId = new mongoose.Types.ObjectId(req.user._id);

        const [bestPaying, worstRaw] = await Promise.all([
            Transaction.aggregate([
                { $match: { shopId, type: 'collection' } },
                { $group: { _id: '$customerId', totalPaid: { $sum: '$amount' } } },
                { $sort: { totalPaid: -1 } },
                { $limit: 5 },
                { $lookup: { from: 'customers', localField: '_id', foreignField: '_id', as: 'customer' } },
                { $unwind: '$customer' },
                { $project: { name: '$customer.name', phone: '$customer.phone', totalPaid: 1 } }
            ]),
            Customer.find({ shopId, totalBalance: { $gt: 0 } })
                .sort({ totalBalance: -1 })
                .limit(5)
                .select('name phone totalBalance riskScore')
        ]);

        // Add daysSinceLastPayment for each customer
        const worstPaying = await Promise.all(worstRaw.map(async (c) => {
            const lastPayment = await Transaction.findOne(
                { shopId, customerId: c._id, type: 'collection' },
                { createdAt: 1 },
                { sort: { createdAt: -1 } }
            );
            const daysSinceLastPayment = lastPayment
                ? Math.floor((Date.now() - new Date(lastPayment.createdAt)) / 86400000)
                : 999;
            return { ...c.toObject(), daysSinceLastPayment };
        }));

        res.json({ success: true, data: { bestPaying, worstPaying } });
    } catch (err) {
        next(err);
    }
};


//real MongoDB data python ML ko bhejo ,  risk score wapas lo
exports.getRiskReport = async (req, res, next) => {
    try {
        const shopId = new mongoose.Types.ObjectId(req.user._id);

        const customers = await Customer.find({ shopId });

        const enrichedCustomers = await Promise.all(
            customers.map(async (c) => {
                const transactions = await Transaction.find({
                    shopId,
                    customerId: c._id
                }).sort({ createdAt: -1 });

                const lastPayment = transactions.find(t => t.type === 'payment');
                const daysSinceLastPayment = lastPayment
                    ? Math.floor((Date.now() - new Date(lastPayment.createdAt)) / 86400000)
                    : 999;

                const totalPaid = transactions
                    .filter(t => t.type === 'payment')
                    .reduce((sum, t) => sum + t.amount, 0);

                return {
                    _id: c._id.toString(),
                    name: c.name,
                    phone: c.phone,
                    totalBalance: c.totalBalance,
                    totalTransactions: transactions.length,
                    totalPaid,
                    daysSinceLastPayment
                };
            })
        );

        if (enrichedCustomers.length === 0) {
            return res.json({ success: true, data: [] });
        }

        const mlResponse = await axios.post('https://khataai-project-mlpart.onrender.com/risk-report', {
            customers: enrichedCustomers
        });

        res.json({ success: true, data: mlResponse.data.data });

    } catch (err) {
        console.error('Risk report error:', err.message);
        next(err);
    }
};

//smart insights
exports.getSmartInsight = async (req, res, next) => {
    try {
        const shopId = new mongoose.Types.ObjectId(req.user._id);
        const customers = await Customer.find({ shopId });

        const enrichedCustomers = await Promise.all(
            customers.map(async (c) => {
                const transactions = await Transaction.find({ shopId, customerId: c._id }).sort({ createdAt: -1 });
                const lastPayment = transactions.find(t => t.type === 'payment');
                const daysSinceLastPayment = lastPayment
                    ? Math.floor((Date.now() - new Date(lastPayment.createdAt)) / 86400000)
                    : 999;
                const totalPaid = transactions.filter(t => t.type === 'payment').reduce((s, t) => s + t.amount, 0);

                return {
                    _id: c._id.toString(),
                    name: c.name,
                    totalBalance: c.totalBalance,
                    totalTransactions: transactions.length,
                    totalPaid,
                    daysSinceLastPayment
                };
            })
        );

        if (enrichedCustomers.length === 0) {
            return res.json({ success: true, data: { insight: "No customers yet.", topRiskyCustomers: [] } });
        }

        const mlResponse = await axios.post('https://khataai-project-mlpart.onrender.com/smart-insight', {
            customers: enrichedCustomers,
            topN: 3
        });

        res.json({ success: true, data: mlResponse.data.data });

    } catch (err) {
        console.error('Smart insight error:', err.message);
        next(err);
    }
};
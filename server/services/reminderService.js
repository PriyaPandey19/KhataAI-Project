//raat 9 baje automatically saare shopkeeper ko daily summary bhejta hai
//aur pending reminder process karta hai

const cron = require('node-cron');
const Reminder = require('../models/Reminder');
const Customer = require('../models/Customer');
const User = require('../models/User')
const {sendWhatsApp, buildReminderMessage, buildSummaryMessage} = require('./twilioService');
const Transaction = require('../models/Transaction');

//pending reminder process karo
//har 5 min check karta hai koi reminder due hai kya

const processPendingReminders = async() => {
    try{
        const dueReminders = await Reminder.find({
            status: 'pending',
            scheduledAt: { $lte: new Date() }
        })
        .populate('customerId', 'name phone')
        .populate('shopId','shopName phone');

        for(const reminder of dueReminders){
            try{
                const message = buildReminderMessage(
                    reminder.customerId.name,
                    reminder.amount,
                    reminder.shopId.shopName
                );

                //customer ko reminder bhejo
                await sendWhatsApp(reminder.customerId.phone, message);

                //reminder status update karo
                await Reminder.findByIdAndUpdate(reminder._id,{
                    status: 'sent',
                    sentAt: new Date()
                });
            }catch(err){
                //ek reminder fail ho to baaki process hot rahen
                console.log(`Reminder failed for ${reminder._id}`, err.message);

                await Reminder.findByIdAndUpdate(reminder._id, {
                   status: 'failed',
                    $inc: { retryCount: 1 }  
                });
            }
        }
    }catch(err){
        console.log('processPendingReminders error:', err.message);
    }
};


//daily summary sarre shopkeeper ko bhejo
const sendDailySummaryToAll = async() => {
    try{
        const shops = await User.find({});

        for(const shop of shops){
            try{
                const todayStart = new Date();
                todayStart.setHours(0,0,0,0);

                const todayTransactions = await Transaction.find({
                    shopId: shop._id,
                    createdAt: {$gte: todayStart }
                });

                let totalCredit = 0;
                let totalCollection = 0;

                todayTransactions.forEach(t => {
                    if(t.type === 'credit') totalCredit += t.amount;
                    else totalCollection += t.amount;
                });

                const topPending = await Customer.find({
                    shopId: shop._id,
                    totalBalance: { $gt: 0 }
                })
                  .sort({ totalBalance: -1 })
                    .limit(3);

                      const pendingList = topPending
                    .map((c, i) => `${i + 1}. ${c.name} - Rs.${c.totalBalance}`)
                    .join('\n');

                const message = buildSummaryMessage(totalCredit, totalCollection, pendingList);

                await sendWhatsApp(shop.phone, message);
            }catch(err){
             console.error(`Summary failed for shop ${shop._id}:`, err.message);   
            }
        }
    }catch(err){
      console.error('sendDailySummaryToAll error:', err.message);  
    }
}

const startCronJobs = () => {

    // har 5 minute mein pending reminders check karo
    // '*/5 * * * *' = every 5 minutes
    cron.schedule('*/5 * * * *', () => {
        console.log('Checking pending reminders...');
        processPendingReminders();
    });

    // raat 9 baje daily summary bhejo
    // '0 21 * * *' = 21:00 every day
    cron.schedule('0 21 * * *', () => {
        console.log('Sending daily summary to all shops...');
        sendDailySummaryToAll();
    });

    console.log('Cron jobs started');
};


module.exports = {startCronJobs,processPendingReminders,sendDailySummaryToAll};
// KhataAI — Voice Entry Controller (Website)
// 📚 Sr.No.8  - LLM: Groq se text parse karo (shared service)
// 📚 Sr.No.1  - WebSocket: dashboard real time update
// 📚 Sr.No.18 - Sharding: shopId JWT se aata hai

const Customer    = require('../models/Customer');
const Transaction = require('../models/Transaction');
const { parseTransaction } = require('../services/gptService');

exports.processVoiceEntry = async (req, res, next) => {
    try {
        const { text } = req.body;
        const shopId = req.user._id;

        if (!text || !text.trim()) {
            return res.status(400).json({ success: false, message: 'No text provided' });
        }

        console.log('🎤 Voice entry text:', text);

        // ✅ Fetch existing customers FIRST — give Groq real names to match against
        const existingCustomers = await Customer.find({ shopId }).select('name');
        const existingNames = existingCustomers.map(c => c.name);

        const parsedData = await parseTransaction(text, existingNames);
        console.log('✅ Parsed data:', parsedData);

        if (!parsedData.customerName || parsedData.customerName.toLowerCase() === 'unknown' || !parsedData.amount || parsedData.amount <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Could not understand customer name or amount. Please mention both clearly, e.g. "Ramesh ne 500 rupay diye"'
            });
        }

        // Try exact match first (Groq should now return existing name if it matched)
        let customer = await Customer.findOne({
            shopId,
            name: parsedData.customerName
        });

        // Fallback — partial match (in case Groq still returns slightly different casing/spacing)
        if (!customer) {
            const nameWords = parsedData.customerName.trim().split(/\s+/).filter(Boolean);
            const namePattern = nameWords.join('|');
            customer = await Customer.findOne({
                shopId,
                name: { $regex: namePattern, $options: 'i' }
            });
        }

        if (!customer) {
            customer = await Customer.create({
                shopId,
                name: parsedData.customerName,
                phone: ''
            });
        }

        const transaction = await Transaction.create({
            shopId,
            customerId:    customer._id,
            type:          parsedData.type,
            amount:        parsedData.amount,
            description:   parsedData.description,
            transcription: text,
            source:        'voice'
        });

        const balanceChange = parsedData.type === 'credit'
            ? parsedData.amount
            : -parsedData.amount;

        const updatedCustomer = await Customer.findByIdAndUpdate(
            customer._id,
            { $inc: { totalBalance: balanceChange } },
            { new: true }
        );

        const io = req.app.get('io');
        if (io) {
            io.emit('newTransaction', {
                shopId,
                transaction,
                customerName: customer.name,
                type: parsedData.type,
                amount: parsedData.amount,
            });
        }

        res.json({
            success: true,
            data: {
                customerName: customer.name,
                type: parsedData.type,
                amount: parsedData.amount,
                description: parsedData.description,
                newBalance: updatedCustomer.totalBalance,
            }
        });

    } catch (err) {
        console.error(' Voice entry error:', err.message);
        next(err);
    }
};
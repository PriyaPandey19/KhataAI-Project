// KhataAI — WhatsApp Controller
// 📚 Sr.No.1  - WebSocket: dashboard real time update
// 📚 Sr.No.8  - LLM: Groq Whisper + LLaMA
// 📚 Sr.No.15 - HTTP: Twilio webhook
// 📚 Sr.No.16 - Serialization: JSON parse from LLM

const axios  = require('axios');
const Groq   = require('groq-sdk');
const twilio = require('twilio');
const Customer    = require('../models/Customer');
const Transaction = require('../models/Transaction');
const User        = require('../models/User');
const { parseTransaction } = require('../services/gptService');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const twilioClient = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
);

const sendWhatsApp = async (to, message) => {
    console.log('📤 Sending WhatsApp to:', to);
    const result = await twilioClient.messages.create({
        from: process.env.TWILIO_WHATSAPP_NUMBER,
        to:   `whatsapp:${to}`,
        body: message
    });
    console.log('✅ WhatsApp sent, SID:', result.sid);
    return result;
};

const transcribeAudio = async (audioUrl) => {
    const response = await axios.get(audioUrl, {
        responseType: 'arraybuffer',
        auth: {
            username: process.env.TWILIO_ACCOUNT_SID,
            password: process.env.TWILIO_AUTH_TOKEN
        }
    });
    const audioBuffer = Buffer.from(response.data);
    const transcription = await groq.audio.transcriptions.create({
        file:     new File([audioBuffer], 'voice.ogg', { type: 'audio/ogg' }),
        model:    'whisper-large-v3',
        language: 'hi'
    });
    return transcription.text;
};

exports.webhook = async (req, res, next) => {
    try {
        console.log(' Webhook body:', JSON.stringify(req.body, null, 2));

        const { From, Body, MediaUrl0, MediaContentType0 } = req.body;

        console.log('From:', From);
        console.log('Body:', Body);
        console.log('MediaUrl0:', MediaUrl0);
        console.log('MediaContentType0:', MediaContentType0);

        const shopkeeperPhone = From?.replace('whatsapp:', '');
        console.log('shopkeeperPhone:', shopkeeperPhone);

        // Sr.No.18 — Sharding: phone se shop dhundo
        const shop = await User.findOne({
            $or: [
                { phone: shopkeeperPhone },
                { phone: shopkeeperPhone?.replace('+91', '') },
                { whatsappNumber: shopkeeperPhone }
            ]
        });

        console.log('Shop found:', shop ? shop.shopName : 'NOT FOUND');

        if (!shop) {
            console.log('❌ Shop not found for phone:', shopkeeperPhone);
            try {
                await sendWhatsApp(shopkeeperPhone, '❌ Shop not registered. Please register at KhataAI.');
            } catch(e) {
                console.log('Send error:', e.message);
            }
            return res.status(200).send('<Response></Response>');
        }

        // ✅ Sr.No.18 — existing customers fetch karo, Groq ko real names do for matching
        const existingCustomers = await Customer.find({ shopId: shop._id }).select('name');
        const existingNames = existingCustomers.map(c => c.name);

        let transcription = '';
        let parsedData    = null;

        // Case 1: voice note
        if (MediaUrl0 && MediaContentType0?.includes('audio')) {
            console.log('🎤 Processing voice note...');
            await sendWhatsApp(shopkeeperPhone, '🎤 Voice note mili! Processing...');
            transcription = await transcribeAudio(MediaUrl0);
            console.log('📝 Transcription:', transcription);
            await sendWhatsApp(shopkeeperPhone, `📝 Suna: "${transcription}"`);
            parsedData = await parseTransaction(transcription, existingNames);
        }
        // Case 2: text message
        else if (Body) {
            console.log('💬 Processing text message:', Body);
            transcription = Body;
            parsedData    = await parseTransaction(Body, existingNames);
        }

        console.log('✅ Parsed data:', parsedData);

        if (!parsedData) {
            await sendWhatsApp(shopkeeperPhone, '❓ Samjh nahi aaya, dobara try karo!');
            return res.status(200).send('<Response></Response>');
        }

        // ✅ Validation — reject incomplete data instead of saving garbage
        if (!parsedData.customerName || parsedData.customerName.toLowerCase() === 'unknown' || !parsedData.amount || parsedData.amount <= 0) {
            await sendWhatsApp(shopkeeperPhone, '❓ Customer ka naam ya amount samajh nahi aaya. Phir se try karo, jaise: "Ramesh ne 500 rupay diye"');
            return res.status(200).send('<Response></Response>');
        }

        // Customer dhundo ya banao — exact match pehle try karo
        let customer = await Customer.findOne({
            shopId: shop._id,
            name: parsedData.customerName
        });

        // Fallback — partial match
        if (!customer) {
            const nameWords = parsedData.customerName.trim().split(/\s+/).filter(Boolean);
            const namePattern = nameWords.join('|');
            customer = await Customer.findOne({
                shopId: shop._id,
                name: { $regex: namePattern, $options: 'i' }
            });
        }

        if (!customer) {
            console.log('👤 Creating new customer:', parsedData.customerName);
            customer = await Customer.create({
                shopId: shop._id,
                name:   parsedData.customerName,
                phone:  ''
            });
        }

        // Transaction save karo
        const transaction = await Transaction.create({
            shopId:        shop._id,
            customerId:    customer._id,
            type:          parsedData.type,
            amount:        parsedData.amount,
            description:   parsedData.description,
            transcription,
            source:        'whatsapp'
        });

        console.log('💾 Transaction saved:', transaction._id, '| type:', parsedData.type);

        // ✅ correct balance direction
        const balanceChange = parsedData.type === 'credit'
            ? parsedData.amount
            : -parsedData.amount;

        // ✅ get UPDATED customer after balance change for correct confirmation msg
        const updatedCustomer = await Customer.findByIdAndUpdate(
            customer._id,
            {
                $inc: { totalBalance: balanceChange },
                lastTransaction: parsedData.amount
            },
            { new: true }
        );

        // Sr.No.1 — WebSocket: dashboard real time update
        const io = req.app.get('io');
        if (io) {
            io.emit('newTransaction', {
                shopId:       shop._id,
                transaction,
                customerName: customer.name,
                type:         parsedData.type,
                amount:       parsedData.amount,
            });
            console.log('🔴 Socket emitted: newTransaction');
        }

        const action     = parsedData.type === 'credit' ? 'Udhaar diya ✅' : 'Payment mili ✅';
        const newBalance = updatedCustomer.totalBalance;

        await sendWhatsApp(
            shopkeeperPhone,
            `${action}\nCustomer: ${customer.name}\nAmount: ₹${parsedData.amount}\nTotal baaki: ₹${Math.abs(newBalance)}`
        );

        res.status(200).send('<Response></Response>');

    } catch (err) {
        console.error('❌ Webhook error:', err.message);
        console.error(err.stack);
        next(err);
    }
};

exports.sendDailySummary = async (req, res, next) => {
    try {
        const shopId = req.user._id;
        const shop   = req.user;

        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);

        const todayTransactions = await Transaction.find({
            shopId,
            createdAt: { $gte: todayStart }
        }).populate('customerId', 'name');

        let totalCredit     = 0;
        let totalCollection = 0;

        todayTransactions.forEach(t => {
            if (t.type === 'credit')          totalCredit     += t.amount;
            else if (t.type === 'collection') totalCollection += t.amount;
        });

        const topPending = await Customer.find({ shopId, totalBalance: { $gt: 0 } })
            .sort({ totalBalance: -1 })
            .limit(3);

        const pendingList = topPending
            .map((c, i) => `${i + 1}. ${c.name} - ₹${c.totalBalance}`)
            .join('\n');

        const summary = `*Aaj ka KhataAI Summary* 📊\n\nUdhaar diya: ₹${totalCredit}\nWapas mila: ₹${totalCollection}\nNet: ₹${totalCredit - totalCollection}\n\nTop Pending:\n${pendingList}`;

        await sendWhatsApp(shop.phone, summary);
        res.json({ success: true, message: 'Summary sent' });

    } catch (err) {
        next(err);
    }
};
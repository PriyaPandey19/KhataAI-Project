// KhataAI — AI Insight Controller
// 📚 Sr.No.8  - LLM: Groq se risk prediction
// 📚 Sr.No.18 - Sharding: shopId se sirf apna data

const Groq = require('groq-sdk');
const Customer = require('../models/Customer');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

exports.getSmartInsight = async (req, res, next) => {
    try {
        const shopId = req.user._id;

        // Sr.No.18 — sirf is shop ke customers
        const customers = await Customer.find({ shopId })
            .sort({ totalBalance: -1 })
            .limit(10);

        if (customers.length === 0) {
            return res.json({
                success: true,
                data: { insight: 'No customers yet. Add some to get AI insights.', topRiskyCustomers: [] }
            });
        }

        // Customer data ko Groq ke liye prepare karo
        const customerData = customers.map(c => ({
            name: c.name,
            totalBalance: c.totalBalance || 0,
            daysSinceLastPayment: c.updatedAt
                ? Math.floor((Date.now() - new Date(c.updatedAt)) / 86400000)
                : 999,
        }));

        const completion = await groq.chat.completions.create({
            model: 'llama-3.3-70b-versatile',
            messages: [
                {
                    role: 'system',
                    content: `You are a financial risk analyst for an Indian kirana shop.
Given a list of customers with their outstanding balance and days since last payment,
predict risk level for each customer and write one short insight sentence.

Risk rules:
- HIGH risk: balance > 10000 OR days since payment > 30
- MEDIUM risk: balance > 2000 OR days since payment > 14
- LOW risk: everything else

Always respond with valid JSON only, no extra text. Format:
{
  "insight": "one sentence summary of overall collection risk",
  "topRiskyCustomers": [
    {"name":"...", "totalBalance":number, "daysSinceLastPayment":number, "riskLevel":"HIGH|MEDIUM|LOW", "suggestedAction":"ACTION NEEDED|FOLLOW UP|MONITOR"}
  ]
}
Only include customers with MEDIUM or HIGH risk in topRiskyCustomers, max 5, sorted by risk.`
                },
                {
                    role: 'user',
                    content: JSON.stringify(customerData)
                }
            ],
            temperature: 0.2
        });

        const raw = completion.choices[0].message.content.trim();
        console.log(' AI Insight raw response:', raw);

        const parsed = JSON.parse(raw);

        res.json({
            success: true,
            data: {
                insight: parsed.insight || '',
                topRiskyCustomers: parsed.topRiskyCustomers || []
            }
        });

    } catch (err) {
        console.error('❌ AI Insight error:', err.message);
        next(err);
    }
};
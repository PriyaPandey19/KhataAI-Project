// KhataAI — Shared Transaction Parser
// 📚 Sr.No.8 - LLM: Groq se text se transaction details nikalo
// Used by both WhatsApp webhook AND website Voice Entry

const Groq = require('groq-sdk');
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

exports.parseTransaction = async (transcription, existingNames = []) => {
    const namesHint = existingNames.length > 0
        ? `\n\nKNOWN CUSTOMERS for this shop: ${existingNames.join(', ')}\nIf the speaker's name sounds like or matches any of these known customers (even if spoken in Hindi/Devanagari), use the EXACT name from this list. Match phonetically — e.g. "पटेल" should match "Amit Patel" if Patel is part of a known name.`
        : '';

    const completion = await groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [
            {
                role: 'system',
                content: `You are a helpful assistant for an Indian kirana shop.
Extract transaction details from Hindi/Hinglish voice notes.
Always respond with valid JSON only, no extra text.

IMPORTANT: type must be EXACTLY "credit" or "collection" (not "payment").
- "udhar diya", "samaan diya", "credit" = "credit"
- "paisa liya", "vasuli", "payment mila", "collected", "payment ki", "payment kiya" = "collection"

IMPORTANT: amount must be extracted as a number from ANY phrasing, including:
- "500 rupay diye" → amount: 500
- "500 ke payment ki" → amount: 500
- "500 ka udhar" → amount: 500
- Numbers may appear before or after currency words like "rupay", "rupaye", "ke", "ka", "₹"

customerName AND description must always be transliterated to English/Roman script, never Devanagari (Hindi script).
${namesHint}

If you cannot find a clear customer name, set customerName to an empty string "".
If you cannot find a clear amount, set amount to 0.
Never guess or fabricate values that are not stated.

Return: {"customerName":"...","type":"credit|collection","amount":number,"description":"..."}`
            },
            { role: 'user', content: transcription }
        ],
        temperature: 0.1
    });

    const raw = completion.choices[0].message.content.trim();
    console.log(' LLM raw response:', raw);

    const parsed = JSON.parse(raw);

    if (parsed.type === 'payment') {
        parsed.type = 'collection';
    }
    if (!['credit', 'collection'].includes(parsed.type)) {
        console.warn(` Unknown type "${parsed.type}", defaulting to "credit"`);
        parsed.type = 'credit';
    }

    return parsed;
};
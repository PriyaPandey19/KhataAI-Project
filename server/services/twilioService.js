//whatsapp messages bhejna ka ek central service
//whatsapp controller aur reminder service dono ye use karte hai

const twilio = require('twilio');

const twilioClient = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
);

//shopkeeper ko whatsapp pe message bhejo
const sendWhatsApp = async(to, message) => {
    try{
       const result = await twilioClient.messages.create({
        from: process.env.TWILIO_WHATSAPP_NUMBER,
        to: `whatsapp:${to}`,
        body: message
       });

       console.log(`WhatsApp sent to ${to}: ${result.sid}`);
       return result;
    }catch(err){
        console.error(`WhatsApp failed to ${to}:`, err.message);
        throw err;
    }
};

//reminder msg format
const buildReminderMessage = (customerName, amount, shopName) => {
    return `Hello ${customerName},\n\nYe ${shopName} ki taraf se reminder hai.\nAapka outstanding balance: Rs.${amount}\n\nKripya jald payment karein.\n\nDhanyawad.`;
};

//daily summary msg format
const buildSummaryMessage = (totalCredit, totalCollection, pendingList) => {
    return `Aaj ka KhataAI Summary\n\nUdhaar diya: Rs.${totalCredit}\nWapas mila: Rs.${totalCollection}\nNet: Rs.${totalCredit - totalCollection}\n\nTop Pending:\n${pendingList}`;
};


module.exports = {sendWhatsApp, buildReminderMessage, buildSummaryMessage};
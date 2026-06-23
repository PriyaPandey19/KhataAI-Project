//voice note audio file ko text mein convert karta hai

const axios = require('axios');
const Groq = require('groq-sdk');

const groq = new Groq({apiKey: process.env.GROQ_API_KEY});

//twilio ke audio URL se voice note download karke transcribe karo
const transcribeAudio = async(audioUrl) => {

    //twilio ka private URL hai - auth required hai downlad ke liye
    const response = await axios.get(audioUrl, {
        responseType: 'arraybuffer',
        auth: {
            username: process.env.TWILIO_ACCOUNT_SID,
            password: process.env.TWILIO_AUTH_TOKEN
        }
    });

    const audioBuffer = Buffer.from(response.data);

    //groq whisper ko audio bhejo
    //whisper-large-v3 = best accuracy ofr hindi.Highlish
    const transcription = await groq.audio.transcriptions.create({
     file: new File([audioBuffer], 'voice.ogg', { type: 'audio/ogg' }),
        model: 'whisper-large-v3',
        language: 'hi'  // Hindi primary language   
    });
    return transcription.text;
}

module.exports = {transcribeAudio};
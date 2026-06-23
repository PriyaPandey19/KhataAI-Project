# ml/voiceParser.py
# 📚 Sr.No.8 — LLM: Groq se voice transcript parse karke transaction extract karo
# WhatsApp voice text → { customerName, amount, type, description }

import os
import json
from groq import Groq

client = Groq(api_key=os.environ.get("GROQ_API_KEY"))

def parse_voice_transaction(transcript: str, customers: list = []) -> dict:
    """
    Parse a WhatsApp voice transcript into a structured transaction object.
    
    Args:
        transcript: raw text from WhatsApp voice note
        customers: list of { _id, name } dicts from MongoDB (for name matching)
    
    Returns:
        dict with customerName, amount, type, description, confidence
    """
    customer_names = ", ".join([c.get("name", "") for c in customers]) or "none yet"

    prompt = f"""
You are a transaction parser for an Indian kirana (grocery) shop ledger app called KhataAI.
The shop owner speaks in Hindi/English mix (Hinglish) via WhatsApp voice notes.

Known customers in the system: {customer_names}

Voice transcript: "{transcript}"

Extract the transaction details and return ONLY a valid JSON object, no explanation:
{{
  "customerName": "exact name from transcript, or closest match from known customers",
  "amount": <number, no currency symbol>,
  "type": "credit" or "collection",
  "description": "short description of what was bought or paid",
  "confidence": <0.0 to 1.0, how confident you are>,
  "rawIntent": "one line summary of what the speaker said"
}}

Rules:
- "udhar", "udhaar", "credit diya", "samaan diya" = type: "credit"
- "vasuli", "paisa liya", "payment aaya", "collected" = type: "collection"
- If amount not clear, set amount: 0
- If customer not clear, use customerName: "Unknown"
- Always return valid JSON, nothing else
"""

    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.1,
            max_tokens=300,
        )

        raw = response.choices[0].message.content.strip()

        # Strip markdown fences if Groq wraps in ```json
        clean = raw.replace("```json", "").replace("```", "").strip()
        parsed = json.loads(clean)

        # Try to match customerName to a real _id from MongoDB customers list
        matched = next(
            (c for c in customers if c.get("name", "").lower() == parsed.get("customerName", "").lower()),
            None
        )

        return {
            **parsed,
            "customerId": str(matched["_id"]) if matched else None,
            "source": "whatsapp_voice",
        }

    except Exception as e:
        print(f"voiceParser error: {e}")
        return {
            "customerName": "Unknown",
            "amount": 0,
            "type": "credit",
            "description": transcript[:80],
            "confidence": 0,
            "customerId": None,
            "source": "whatsapp_voice",
            "error": str(e),
        }
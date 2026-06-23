# ml/Riskpredictor.py
# 📚 Sr.No.8 — LLM: Groq se customer risk prediction
# Outstanding balance + payment history → risk score + suggested action

import os
import json
from groq import Groq
from dotenv import load_dotenv
load_dotenv(dotenv_path='../server/.env')

client = Groq(api_key=os.environ.get("GROQ_API_KEY"))


def pre_score(customer: dict) -> int:
    """
    Rule-based pre-scoring before sending to Groq.
    Returns score 0-100.
    """
    balance   = customer.get("totalBalance", 0)
    days_since = customer.get("daysSinceLastPayment", 0)

    score = 0

    # Balance scoring
    if balance > 50000:   score += 50
    elif balance > 20000: score += 35
    elif balance > 5000:  score += 20
    elif balance > 0:     score += 10

    #  Fix: 999 means NEVER paid — that is the highest risk
    if days_since >= 999:  score += 50   # never paid at all
    elif days_since > 60:  score += 40
    elif days_since > 30:  score += 25
    elif days_since > 14:  score += 15
    elif days_since > 7:   score += 5

    return min(score, 100)


def predict_single(customer: dict) -> dict:
    """
    Predict risk for a single customer using Groq LLM.
    """
    days = customer.get('daysSinceLastPayment', 0)
    days_label = "never made a payment" if days >= 999 else f"{days} days since last payment"

    prompt = f"""
You are a financial risk analyst for KhataAI, an Indian kirana shop credit ledger.

Analyze this customer's payment profile and predict their default risk:

Customer: {customer.get('name')}
Outstanding Balance: ₹{customer.get('totalBalance', 0)}
Payment Status: {days_label}
Total Transactions: {customer.get('totalTransactions', 0)}
Total Amount Paid Back: ₹{customer.get('totalPaid', 0)}

Return ONLY a valid JSON object, no explanation:
{{
  "riskLevel": "HIGH" | "MEDIUM" | "LOW",
  "riskScore": <integer 0-100, higher = more risky>,
  "reason": "1 sentence explanation in simple English",
  "suggestedAction": "SEND REMINDER" | "CALL CUSTOMER" | "ESCALATE" | "MONITOR",
  "urgency": "CRITICAL" | "HIGH" | "MEDIUM" | "LOW"
}}

Guidelines:
- Never paid + balance > 0 → always HIGH risk, riskScore 80+
- riskScore 75-100 = HIGH risk
- riskScore 40-74  = MEDIUM risk
- riskScore 0-39   = LOW risk
- If balance > ₹50,000 → HIGH regardless
- Always return valid JSON only
"""

    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.1,
            max_tokens=200,
        )
        raw   = response.choices[0].message.content.strip()
        clean = raw.replace("```json", "").replace("```", "").strip()
        return json.loads(clean)

    except Exception as e:
        print(f"riskPredictor error for {customer.get('name')}: {e}")
        score = pre_score(customer)
        return {
            "riskLevel":       "HIGH" if score >= 60 else "MEDIUM" if score >= 30 else "LOW",
            "riskScore":       score,
            "reason":          "Scored by rule-based fallback due to AI error.",
            "suggestedAction": "CALL CUSTOMER" if score >= 60 else "SEND REMINDER" if score >= 30 else "MONITOR",
            "urgency":         "HIGH" if score >= 60 else "MEDIUM",
        }


def predict_all_risks(customers: list) -> list:
    """
    Predict risk for ALL customers with positive balance.
    Sends anyone with score >= 10 to Groq (very low threshold).
    Returns sorted by riskScore descending.
    """
    if not customers:
        return []

    results = []
    for customer in customers:
        score = pre_score(customer)

        #  Fix: lowered threshold to 10 so almost everyone gets AI-scored
        if score >= 10:
            prediction = predict_single(customer)
        else:
            prediction = {
                "riskLevel":       "LOW",
                "riskScore":       score,
                "reason":          "Low balance and recent payment activity.",
                "suggestedAction": "MONITOR",
                "urgency":         "LOW",
            }

        results.append({
            "_id":                  str(customer.get("_id", "")),
            "name":                 customer.get("name"),
            "phone":                customer.get("phone"),
            "totalBalance":         customer.get("totalBalance", 0),
            "daysSinceLastPayment": customer.get("daysSinceLastPayment", 0),
            **prediction,
        })

    return sorted(results, key=lambda x: x["riskScore"], reverse=True)


def get_smart_insight(ranked_customers: list, top_n: int = 3) -> dict:
    """
    Generate AI Smart Insight text + return top risky customers.
    Powers the Analytics page AI card with real customer names.
    """
    #  Fix: include MEDIUM risk too, not just HIGH
    at_risk = [c for c in ranked_customers if c.get("riskLevel") in ("HIGH", "MEDIUM")]
    top     = ranked_customers[:top_n]

    if not at_risk:
        return {
            "insight":           "All customers are paying on time. Collections are on track! 🎉",
            "topRiskyCustomers": top,
        }

    summary = "\n".join([
        f"{c['name']}: ₹{c['totalBalance']} outstanding, "
        f"{'never paid' if c['daysSinceLastPayment'] >= 999 else str(c['daysSinceLastPayment']) + ' days since last payment'}, "
        f"risk: {c['riskLevel']}"
        for c in at_risk[:5]
    ])

    total_at_risk = sum(c["totalBalance"] for c in at_risk)

    prompt = f"""
You are a financial assistant for a kirana shop owner in India.

These customers have payment risk:
{summary}

Total potential recovery: ₹{total_at_risk:,}

Write a SHORT 2-sentence insight for the shop owner (in simple English).
Name the highest risk customer specifically.
Mention total recovery amount.
End with one specific action.
Keep it under 45 words. No bullet points. Plain text only.
"""

    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3,
            max_tokens=120,
        )
        insight = response.choices[0].message.content.strip()
        return {"insight": insight, "topRiskyCustomers": top}

    except Exception as e:
        print(f"get_smart_insight error: {e}")
        top_name = at_risk[0]['name'] if at_risk else 'Unknown'
        return {
            "insight": f"{top_name} and {len(at_risk)-1} others owe ₹{total_at_risk:,} total. Call them immediately to recover dues.",
            "topRiskyCustomers": top,
        }
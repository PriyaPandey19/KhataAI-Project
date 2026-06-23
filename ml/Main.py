# ml/main.py
# FastAPI server — Node.js backend calls these endpoints
# Run: uvicorn main:app --host 0.0.0.0 --port 8000 --reload

from dotenv import load_dotenv
import os

load_dotenv(dotenv_path='../server/.env')  # points to server/.env


from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from Voiceparser import parse_voice_transaction
from Riskpredictor import predict_all_risks, get_smart_insight

app = FastAPI(title="KhataAI ML Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # tighten in production
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Request/Response Models ────────────────────────────────

class Customer(BaseModel):
    _id:                  Optional[str] = None
    name:                 str
    phone:                Optional[str] = None
    totalBalance:         Optional[float] = 0
    totalTransactions:    Optional[int] = 0
    totalPaid:            Optional[float] = 0
    daysSinceLastPayment: Optional[int] = 0

class ParseVoiceRequest(BaseModel):
    transcript: str
    customers:  Optional[List[dict]] = []

class RiskReportRequest(BaseModel):
    customers: List[dict]

class SmartInsightRequest(BaseModel):
    customers: List[dict]
    topN:      Optional[int] = 3


# ── Routes ─────────────────────────────────────────────────

@app.get("/")
def health():
    return {"status": "KhataAI ML service running ✅"}


@app.post("/parse-voice")
async def parse_voice(body: ParseVoiceRequest):
    """
    Parse WhatsApp voice transcript → structured transaction.
    Called by Node.js after receiving WhatsApp webhook.
    """
    if not body.transcript:
        raise HTTPException(status_code=400, detail="transcript is required")

    result = parse_voice_transaction(body.transcript, body.customers)
    return {"success": True, "data": result}


@app.post("/risk-report")
async def risk_report(body: RiskReportRequest):
    """
    Score all customers by risk level.
    Called by Node.js GET /api/ai/risk-report route.
    """
    if not body.customers:
        raise HTTPException(status_code=400, detail="customers list is required")

    ranked = predict_all_risks(body.customers)
    return {"success": True, "data": ranked}


@app.post("/smart-insight")
async def smart_insight(body: SmartInsightRequest):
    """
    Generate AI Smart Insight card data for Analytics page.
    Called by Node.js GET /api/ai/smart-insight route.
    """
    if not body.customers:
        return {"success": True, "data": {
            "insight": "No customer data available yet.",
            "topRiskyCustomers": []
        }}

    ranked = predict_all_risks(body.customers)
    result = get_smart_insight(ranked, body.topN)
    return {"success": True, "data": result}
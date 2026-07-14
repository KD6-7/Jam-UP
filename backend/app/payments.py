import hashlib
import hmac
import os

import requests
from fastapi import HTTPException

RAZORPAY_KEY_ID = os.environ.get("RAZORPAY_KEY_ID", "")
RAZORPAY_KEY_SECRET = os.environ.get("RAZORPAY_KEY_SECRET", "")
RAZORPAY_API = "https://api.razorpay.com/v1"


def create_razorpay_order(amount_paise: int, receipt: str) -> str:
    """Create a Razorpay order and return its id."""
    if not RAZORPAY_KEY_ID or not RAZORPAY_KEY_SECRET:
        raise HTTPException(status_code=503, detail="Payments are not configured")
    try:
        res = requests.post(
            f"{RAZORPAY_API}/orders",
            auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET),
            json={"amount": amount_paise, "currency": "INR", "receipt": receipt},
            timeout=15,
        )
    except requests.RequestException:
        raise HTTPException(status_code=502, detail="Payment gateway unreachable")
    if res.status_code != 200:
        raise HTTPException(status_code=502, detail="Payment gateway rejected the order")
    return res.json()["id"]


def verify_payment_signature(
    razorpay_order_id: str, razorpay_payment_id: str, signature: str
) -> bool:
    """Verify Razorpay's checkout signature (HMAC-SHA256 of order_id|payment_id)."""
    if not RAZORPAY_KEY_SECRET:
        return False
    expected = hmac.new(
        RAZORPAY_KEY_SECRET.encode(),
        f"{razorpay_order_id}|{razorpay_payment_id}".encode(),
        hashlib.sha256,
    ).hexdigest()
    return hmac.compare_digest(expected, signature)

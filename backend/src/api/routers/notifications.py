from fastapi import APIRouter, HTTPException
from ...infrastructure.connectors.resend import send_email

router = APIRouter(tags=["Notifications"])

@router.post("/send-email")
async def send_email_endpoint(
    to: str, subject: str, body: str, from_email: str = "onboarding@resend.dev"
):
    """Sends an email directly via Resend."""
    try:
        response = send_email(to=to, subject=subject, body=body, from_email=from_email)
        return {"status": "success", "response": response}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

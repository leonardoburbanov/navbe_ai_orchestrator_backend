from typing import Any

import resend

from ...core.config import settings


def send_email(
    to: str, 
    subject: str, 
    body: str, 
    from_email: str = "onboarding@resend.dev"
) -> dict[str, Any]:
    """
    Sends an email using Resend API.
    
    :param to: Recipient email address.
    :param subject: Email subject.
    :param body: Email body (HTML).
    :param from_email: Sender email address.
    :return: Resend API response.
    """
    if not settings.RESEND_API_KEY:
        raise ValueError(
            "RESEND_API_KEY is not set in environment variables or .env file."
        )
    
    resend.api_key = settings.RESEND_API_KEY
    
    params = {
        "from": from_email,
        "to": to,
        "subject": subject,
        "html": body,
    }
    
    return resend.Emails.send(params)

"""
User Routes — API key management and credit balance
"""
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db, User, UserApiKey
from core.auth import require_approved
from core.encryption import encrypt_value, decrypt_value, mask_api_key
from core.api_client import KieApiClient

router = APIRouter(prefix="/api/user", tags=["user"])


class ApiKeysResponse(BaseModel):
    success: bool
    kie_api_key_masked: str = ""
    has_kie_key: bool = False


class SaveApiKeysRequest(BaseModel):
    kie_api_key: Optional[str] = None


class CreditBalanceResponse(BaseModel):
    success: bool
    credits: Optional[int] = None
    error: Optional[str] = None


@router.get("/api-keys", response_model=ApiKeysResponse)
async def get_api_keys(
    user: User = Depends(require_approved),
    db: AsyncSession = Depends(get_db)
):
    """Get saved API keys (masked for security)"""
    result = await db.execute(
        select(UserApiKey).where(UserApiKey.user_id == user.id)
    )
    api_keys = result.scalar_one_or_none()

    if not api_keys or not api_keys.kie_api_key:
        return ApiKeysResponse(success=True)

    decrypted = decrypt_value(api_keys.kie_api_key)

    return ApiKeysResponse(
        success=True,
        kie_api_key_masked=mask_api_key(decrypted),
        has_kie_key=bool(decrypted),
    )


@router.put("/api-keys")
async def save_api_keys(
    request: SaveApiKeysRequest,
    user: User = Depends(require_approved),
    db: AsyncSession = Depends(get_db)
):
    """Save or update API keys"""
    result = await db.execute(
        select(UserApiKey).where(UserApiKey.user_id == user.id)
    )
    api_keys = result.scalar_one_or_none()

    if not api_keys:
        api_keys = UserApiKey(user_id=user.id)
        db.add(api_keys)

    if request.kie_api_key is not None:
        api_keys.kie_api_key = encrypt_value(request.kie_api_key)

    await db.commit()

    return {"success": True, "message": "API keys saved"}


@router.get("/credit-balance", response_model=CreditBalanceResponse)
async def get_credit_balance(
    user: User = Depends(require_approved),
    db: AsyncSession = Depends(get_db)
):
    """Check Kie.ai credit balance for current user"""
    result = await db.execute(
        select(UserApiKey).where(UserApiKey.user_id == user.id)
    )
    api_keys = result.scalar_one_or_none()

    if not api_keys or not api_keys.kie_api_key:
        return CreditBalanceResponse(
            success=False,
            error="No Kie.ai API key configured"
        )

    decrypted_key = decrypt_value(api_keys.kie_api_key)
    if not decrypted_key:
        return CreditBalanceResponse(
            success=False,
            error="Invalid stored API key"
        )

    client = KieApiClient(api_key=decrypted_key)
    balance = await client.get_credit_balance()

    if not balance.get("success"):
        return CreditBalanceResponse(
            success=False,
            error=balance.get("error", "Failed to check balance")
        )

    return CreditBalanceResponse(
        success=True,
        credits=balance.get("credits", 0)
    )

"""
Auth Routes — Google OAuth login/signup
"""
from fastapi import APIRouter, Depends, Response
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db, User, UserApiKey
from core.auth import verify_google_token, create_jwt, get_current_user, is_admin_email

router = APIRouter(prefix="/api/auth", tags=["auth"])


class GoogleLoginRequest(BaseModel):
    id_token: str


class UserResponse(BaseModel):
    id: int
    email: str
    name: str
    avatar_url: str | None
    role: str
    is_approved: bool

    class Config:
        from_attributes = True


class LoginResponse(BaseModel):
    success: bool
    token: str | None = None
    user: UserResponse | None = None
    error: str | None = None


@router.post("/google", response_model=LoginResponse)
async def google_login(
    request: GoogleLoginRequest,
    response: Response,
    db: AsyncSession = Depends(get_db)
):
    """
    Login or signup with Google ID token.
    Returns JWT token and user info.
    """
    # Verify Google token
    google_info = verify_google_token(request.id_token)
    email = google_info["email"].lower()

    # Find or create user
    result = await db.execute(select(User).where(User.email == email))
    user = result.scalar_one_or_none()

    if not user:
        # New user — check if admin email
        is_admin = is_admin_email(email)
        user = User(
            email=email,
            name=google_info["name"],
            avatar_url=google_info.get("picture"),
            role="admin" if is_admin else "user",
            is_approved=is_admin,  # Admins auto-approved
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)

        # Create empty API keys row
        api_keys = UserApiKey(user_id=user.id)
        db.add(api_keys)
        await db.commit()
    else:
        # Update profile info
        user.name = google_info["name"]
        user.avatar_url = google_info.get("picture")
        await db.commit()

    # Create JWT
    token = create_jwt(user.id, user.email, user.role)

    # Set cookie
    response.set_cookie(
        key="token",
        value=token,
        httponly=True,
        samesite="lax",
        max_age=72 * 3600,
        secure=False,  # Set True in production with HTTPS
    )

    return LoginResponse(
        success=True,
        token=token,
        user=UserResponse(
            id=user.id,
            email=user.email,
            name=user.name,
            avatar_url=user.avatar_url,
            role=user.role,
            is_approved=user.is_approved,
        )
    )


@router.get("/me", response_model=LoginResponse)
async def get_me(user: User = Depends(get_current_user)):
    """Get current authenticated user info"""
    return LoginResponse(
        success=True,
        user=UserResponse(
            id=user.id,
            email=user.email,
            name=user.name,
            avatar_url=user.avatar_url,
            role=user.role,
            is_approved=user.is_approved,
        )
    )


@router.post("/logout")
async def logout(response: Response):
    """Clear auth cookie"""
    response.delete_cookie("token")
    return {"success": True}

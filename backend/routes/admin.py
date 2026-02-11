"""
Admin Routes — User management and moderation
"""
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db, User
from core.auth import require_admin

router = APIRouter(prefix="/api/admin", tags=["admin"])


class UserListItem(BaseModel):
    id: int
    email: str
    name: str
    avatar_url: str | None
    role: str
    is_approved: bool
    created_at: str

    class Config:
        from_attributes = True


class UserListResponse(BaseModel):
    users: list[UserListItem]


@router.get("/users", response_model=UserListResponse)
async def list_users(
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    """List all registered users (admin only)"""
    result = await db.execute(select(User).order_by(User.created_at.desc()))
    users = result.scalars().all()

    return UserListResponse(
        users=[
            UserListItem(
                id=u.id,
                email=u.email,
                name=u.name,
                avatar_url=u.avatar_url,
                role=u.role,
                is_approved=u.is_approved,
                created_at=u.created_at.isoformat() if u.created_at else "",
            )
            for u in users
        ]
    )


@router.put("/users/{user_id}/approve")
async def approve_user(
    user_id: int,
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    """Approve a user (admin only)"""
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.is_approved = True
    await db.commit()

    return {"success": True, "message": f"User {user.email} approved"}


@router.put("/users/{user_id}/reject")
async def reject_user(
    user_id: int,
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    """Reject/ban a user (admin only)"""
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if user.role == "admin":
        raise HTTPException(status_code=400, detail="Cannot reject admin users")

    user.is_approved = False
    await db.commit()

    return {"success": True, "message": f"User {user.email} rejected"}

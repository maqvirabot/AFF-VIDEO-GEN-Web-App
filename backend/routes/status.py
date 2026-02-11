"""
Status Routes - Check video generation task status
"""
from fastapi import APIRouter, Depends, Query
from typing import List
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from models.response import CheckStatusResponse, VideoTaskStatus, TaskStatus
from core.api_client import KieApiClient
from core.auth import require_approved
from core.database import get_db, User, UserApiKey, VideoTask
from core.encryption import decrypt_value

router = APIRouter(prefix="/api", tags=["status"])


@router.get("/tasks", response_model=CheckStatusResponse)
async def get_tasks(
    user: User = Depends(require_approved),
    db: AsyncSession = Depends(get_db)
):
    """
    Get user's video history and sync status of active tasks.
    """
    # Get user's API key (for sync)
    result = await db.execute(
        select(UserApiKey).where(UserApiKey.user_id == user.id)
    )
    api_keys = result.scalar_one_or_none()
    
    client = None
    if api_keys and api_keys.kie_api_key:
        kie_key = decrypt_value(api_keys.kie_api_key)
        if kie_key:
            client = KieApiClient(api_key=kie_key)

    # 1. Get ALL active tasks for user
    active_result = await db.execute(
        select(VideoTask).where(
            VideoTask.user_id == user.id,
            VideoTask.status.in_(["pending", "processing"])
        )
    )
    active_tasks = active_result.scalars().all()

    # 2. Sync active tasks with Kie.ai
    if client and active_tasks:
        for task in active_tasks:
            try:
                # Call Kie API
                status_res = await client.get_task_status(task.kie_task_id)
                
                # Update DB
                task.status = status_res.get("status", "pending")
                task.progress = status_res.get("progress", 0)
                if status_res.get("video_url"):
                    task.video_url = status_res.get("video_url")
                if status_res.get("thumbnail_url"):
                    task.thumbnail_url = status_res.get("thumbnail_url")
                if status_res.get("error"):
                    task.error = status_res.get("error")
                
            except Exception as e:
                print(f"Error syncing task {task.kie_task_id}: {e}")
        
        await db.commit()

    # 3. Get ALL tasks (active + history) sorted by date details
    final_result = await db.execute(
        select(VideoTask).where(VideoTask.user_id == user.id).order_by(VideoTask.created_at.desc())
    )
    all_tasks = final_result.scalars().all()

    # Convert to response format
    task_dtos = []
    for t in all_tasks:
        # Convert DB status to Enum if needed, or simple string
        try:
            status_enum = TaskStatus(t.status)
        except:
            status_enum = TaskStatus.PENDING

        task_dtos.append(VideoTaskStatus(
            task_id=t.kie_task_id,
            status=status_enum,
            progress=t.progress or 0,
            video_url=t.video_url,
            thumbnail_url=t.thumbnail_url,
            error=t.error,
            created_at=t.created_at.isoformat() if t.created_at else None
        ))

    return CheckStatusResponse(tasks=task_dtos)

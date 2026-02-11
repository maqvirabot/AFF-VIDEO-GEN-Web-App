"""
Generate Routes - Video generation task creation and prompt preview
"""
import os
from fastapi import APIRouter, Depends, HTTPException
from typing import List
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from models.request import GenerateTaskRequest, PreviewPromptRequest
from models.response import GenerateTaskResponse, PreviewPromptResponse
from core.api_client import KieApiClient
from core.database import get_db, User, UserApiKey, VideoTask
from core.encryption import decrypt_value
from core.prompt_gen import build_prompt, generate_batch_prompts
from core.auth import require_approved

router = APIRouter(prefix="/api", tags=["generate"])


@router.post("/preview-prompt", response_model=PreviewPromptResponse)
async def preview_prompt(
    request: PreviewPromptRequest,
    user: User = Depends(require_approved)
):
    """
    Preview the generated prompt before creating a task
    """
    prompt = build_prompt(
        product_name=request.product_name,
        highlight=request.highlight,
        style=request.style.value,
        persona=request.persona.value
    )

    return PreviewPromptResponse(
        prompt=prompt,
        style=request.style.value,
        persona=request.persona.value
    )


@router.post("/generate-task", response_model=GenerateTaskResponse)
async def generate_task(
    request: GenerateTaskRequest,
    user: User = Depends(require_approved),
    db: AsyncSession = Depends(get_db)
):
    """
    Create video generation task(s) with Kie.ai
    Uses the logged-in user's saved API key.
    """
    # Get user's API key from DB
    result = await db.execute(
        select(UserApiKey).where(UserApiKey.user_id == user.id)
    )
    api_keys = result.scalar_one_or_none()

    if not api_keys or not api_keys.kie_api_key:
        return GenerateTaskResponse(
            success=False,
            error="No Kie.ai API key configured. Go to Settings to add your key."
        )

    kie_key = decrypt_value(api_keys.kie_api_key)
    if not kie_key:
        return GenerateTaskResponse(
            success=False,
            error="Invalid stored API key. Please re-enter your Kie.ai key."
        )

    # Generate unique prompts for batch
    prompts = generate_batch_prompts(
        product_name=request.product_name,
        highlight=request.highlight,
        style=request.style.value,
        persona=request.persona.value,
        count=request.batch_count
    )

    # Create API client with user's key
    client = KieApiClient(api_key=kie_key)

    # Create tasks
    task_ids = []
    errors = []

    for prompt in prompts:
        result = await client.create_task(
            prompt=prompt,
            image_url=request.image_url,
            aspect_ratio=request.aspect_ratio.value,
            n_frames=str(request.duration),
            remove_watermark=request.remove_watermark
        )

        if result.get("success"):
            task_id = result.get("task_id")
            if task_id:
                task_ids.append(task_id)
                
                # Save to DB
                new_task = VideoTask(
                    user_id=user.id,
                    kie_task_id=task_id,
                    product_name=request.product_name,
                    style=request.style.value,
                    status="pending"
                )
                db.add(new_task)
            else:
                errors.append("Task created but no ID returned")
        else:
            errors.append(result.get("error", "Unknown error"))

    # Commit all new tasks
    if task_ids:
        await db.commit()

    # Return results
    if not task_ids:
        return GenerateTaskResponse(
            success=False,
            error="; ".join(errors) if errors else "All tasks failed to create"
        )

    return GenerateTaskResponse(
        success=True,
        task_ids=task_ids,
        error="; ".join(errors) if errors and len(errors) < len(prompts) else None
    )

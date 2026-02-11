"""
Pydantic Response Models for API endpoints
"""
from pydantic import BaseModel
from typing import Optional, List
from enum import Enum


class TaskStatus(str, Enum):
    PENDING = "pending"
    QUEUED = "queued"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"


class PreviewPromptResponse(BaseModel):
    prompt: str
    style: str
    persona: str


class UploadImageResponse(BaseModel):
    success: bool
    url: Optional[str] = None
    error: Optional[str] = None


class GenerateTaskResponse(BaseModel):
    success: bool
    task_ids: List[str] = []
    error: Optional[str] = None


class VideoTaskStatus(BaseModel):
    task_id: str
    status: TaskStatus
    progress: int = 0
    video_url: Optional[str] = None
    thumbnail_url: Optional[str] = None
    error: Optional[str] = None
    created_at: Optional[str] = None


class CheckStatusResponse(BaseModel):
    tasks: List[VideoTaskStatus]


class CreditBalanceResponse(BaseModel):
    success: bool
    credits: Optional[int] = None
    error: Optional[str] = None


class ErrorResponse(BaseModel):
    success: bool = False
    error: str
    detail: Optional[str] = None

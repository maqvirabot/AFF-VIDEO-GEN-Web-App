"""
Pydantic Request Models for API endpoints
"""
from pydantic import BaseModel, Field
from typing import Optional, List
from enum import Enum


class StyleType(str, Enum):
    UNBOXING = "unboxing"
    REVIEW = "review"
    TUTORIAL = "tutorial"
    SHOWCASE = "showcase"
    TESTIMONIAL = "testimonial"


class PersonaType(str, Enum):
    WANITA_INDO = "wanita_indo"
    PRIA_INDO = "pria_indo"
    HIJABERS = "hijabers"
    PRODUCT_ONLY = "product_only"


class AspectRatio(str, Enum):
    PORTRAIT = "portrait"
    LANDSCAPE = "landscape"


class PreviewPromptRequest(BaseModel):
    product_name: str = Field(..., min_length=1, max_length=100)
    highlight: str = Field(..., min_length=1, max_length=500)
    style: StyleType
    persona: PersonaType


class GenerateTaskRequest(BaseModel):
    image_url: str
    product_name: str = Field(..., min_length=1, max_length=100)
    highlight: str = Field(..., min_length=1, max_length=500)
    filename_prefix: Optional[str] = None
    style: StyleType
    persona: PersonaType
    aspect_ratio: AspectRatio = AspectRatio.PORTRAIT
    duration: int = Field(10, description="Number of frames: 10 or 15")
    remove_watermark: bool = True
    batch_count: int = Field(1, ge=1, le=5)


class UploadImageRequest(BaseModel):
    """For base64 upload option"""
    image_base64: str
    filename: Optional[str] = None


class CheckStatusRequest(BaseModel):
    task_ids: List[str]

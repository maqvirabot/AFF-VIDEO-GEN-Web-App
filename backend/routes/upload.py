"""
Upload Routes - Image upload to Cloudinary (global config)
"""
import os
from fastapi import APIRouter, UploadFile, File, Depends, HTTPException

from models.response import UploadImageResponse
from models.request import UploadImageRequest
from core.image_host import ImageHost
from core.auth import require_approved
from core.database import User

router = APIRouter(prefix="/api", tags=["upload"])

# Global Cloudinary config from environment
CLOUDINARY_CLOUD_NAME = os.getenv("CLOUDINARY_CLOUD_NAME", "")
CLOUDINARY_UPLOAD_PRESET = os.getenv("CLOUDINARY_UPLOAD_PRESET", "")


def get_image_host() -> ImageHost:
    """Get configured ImageHost from global env"""
    if not CLOUDINARY_CLOUD_NAME or not CLOUDINARY_UPLOAD_PRESET:
        raise HTTPException(
            status_code=500,
            detail="Cloudinary not configured. Set CLOUDINARY_CLOUD_NAME and CLOUDINARY_UPLOAD_PRESET in .env"
        )
    return ImageHost(
        cloud_name=CLOUDINARY_CLOUD_NAME,
        upload_preset=CLOUDINARY_UPLOAD_PRESET
    )


@router.post("/upload-image", response_model=UploadImageResponse)
async def upload_image(
    file: UploadFile = File(...),
    user: User = Depends(require_approved)
):
    """
    Upload an image file to Cloudinary.
    Uses global Cloudinary config from .env
    """
    # Validate file type
    allowed_types = ["image/jpeg", "image/png", "image/webp", "image/gif"]
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file type. Allowed: {', '.join(allowed_types)}"
        )

    # Check file size (max 10MB)
    content = await file.read()
    if len(content) > 10 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File too large. Max 10MB allowed.")

    # Upload to Cloudinary
    host = get_image_host()
    filename = file.filename.rsplit(".", 1)[0] if file.filename else None
    result = await host.upload_file(content, filename)

    if not result.get("success"):
        return UploadImageResponse(
            success=False,
            error=result.get("error", "Upload failed")
        )

    return UploadImageResponse(
        success=True,
        url=result.get("url")
    )


@router.post("/upload-image-base64", response_model=UploadImageResponse)
async def upload_image_base64(
    request: UploadImageRequest,
    user: User = Depends(require_approved)
):
    """Upload a base64-encoded image to Cloudinary"""
    host = get_image_host()
    result = await host.upload_base64(request.image_base64, request.filename)

    if not result.get("success"):
        return UploadImageResponse(
            success=False,
            error=result.get("error", "Upload failed")
        )

    return UploadImageResponse(
        success=True,
        url=result.get("url")
    )

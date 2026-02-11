"""
Cloudinary Image Host Module
Handles image upload to Cloudinary for AI processing
"""
import cloudinary
import cloudinary.uploader
import httpx
import base64
from typing import Dict, Any, Optional
import logging

logger = logging.getLogger(__name__)


class ImageHost:
    """Cloudinary image upload handler"""
    
    def __init__(self, cloud_name: str, upload_preset: str, api_key: Optional[str] = None, api_secret: Optional[str] = None):
        """
        Initialize Cloudinary configuration
        
        Args:
            cloud_name: Cloudinary cloud name
            upload_preset: Unsigned upload preset name
            api_key: Optional API key for signed uploads
            api_secret: Optional API secret for signed uploads
        """
        self.cloud_name = cloud_name
        self.upload_preset = upload_preset
        self.api_key = api_key
        self.api_secret = api_secret
        
        # Configure cloudinary if we have full credentials
        if api_key and api_secret:
            cloudinary.config(
                cloud_name=cloud_name,
                api_key=api_key,
                api_secret=api_secret
            )
    
    async def upload_base64(self, image_base64: str, filename: Optional[str] = None) -> Dict[str, Any]:
        """
        Upload a base64-encoded image to Cloudinary
        
        Args:
            image_base64: Base64-encoded image data (with or without data URI prefix)
            filename: Optional public_id for the uploaded image
            
        Returns:
            Dict with success, url, or error
        """
        try:
            # Strip data URI prefix if present
            if "," in image_base64:
                image_base64 = image_base64.split(",")[1]
            
            # Build upload URL
            upload_url = f"https://api.cloudinary.com/v1_1/{self.cloud_name}/image/upload"
            
            # Prepare form data
            form_data = {
                "file": f"data:image/jpeg;base64,{image_base64}",
                "upload_preset": self.upload_preset
            }
            
            if filename:
                form_data["public_id"] = filename
            
            async with httpx.AsyncClient(timeout=60.0) as client:
                response = await client.post(upload_url, data=form_data)
                response.raise_for_status()
                data = response.json()
                
                return {
                    "success": True,
                    "url": data.get("secure_url"),
                    "public_id": data.get("public_id"),
                    "width": data.get("width"),
                    "height": data.get("height")
                }
                
        except httpx.HTTPStatusError as e:
            logger.error(f"Cloudinary upload error: {e.response.status_code} - {e.response.text}")
            return {
                "success": False,
                "error": f"Upload failed: {e.response.status_code}",
                "detail": e.response.text
            }
        except Exception as e:
            logger.error(f"Image upload failed: {str(e)}")
            return {
                "success": False,
                "error": str(e)
            }
    
    async def upload_file(self, file_content: bytes, filename: Optional[str] = None) -> Dict[str, Any]:
        """
        Upload raw file bytes to Cloudinary using official SDK (Unsigned)
        """
        try:
            import io
            import asyncio
            from functools import partial

            # Prepare options
            options = {
                "upload_preset": self.upload_preset,
                "cloud_name": self.cloud_name
            }
            if filename:
                options["public_id"] = filename

            # Run synchronous SDK method in thread pool
            result = await asyncio.to_thread(
                cloudinary.uploader.unsigned_upload,
                io.BytesIO(file_content),
                self.upload_preset,
                cloud_name=self.cloud_name,
                public_id=filename
            )
            
            return {
                "success": True,
                "url": result.get("secure_url"),
                "public_id": result.get("public_id"),
                "width": result.get("width"),
                "height": result.get("height")
            }
            
        except Exception as e:
            logger.error(f"File upload failed: {str(e)}")
            return {
                "success": False,
                "error": str(e)
            }
    
    def get_upload_signature(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generate a signed upload signature for direct browser upload
        Only works if api_key and api_secret are configured
        
        Args:
            params: Upload parameters to sign
            
        Returns:
            Dict with signature, timestamp, api_key
        """
        if not self.api_key or not self.api_secret:
            return {
                "success": False,
                "error": "Signed uploads require api_key and api_secret"
            }
        
        try:
            import time
            timestamp = int(time.time())
            
            # Build params to sign
            params_to_sign = {**params, "timestamp": timestamp}
            
            # Generate signature
            signature = cloudinary.utils.api_sign_request(params_to_sign, self.api_secret)
            
            return {
                "success": True,
                "signature": signature,
                "timestamp": timestamp,
                "api_key": self.api_key,
                "cloud_name": self.cloud_name
            }
            
        except Exception as e:
            logger.error(f"Signature generation failed: {str(e)}")
            return {
                "success": False,
                "error": str(e)
            }

"""
Kie.ai API Client
Handles communication with Kie.ai video generation API
"""
import httpx
import json
from typing import Optional, Dict, Any
import logging

logger = logging.getLogger(__name__)


class KieApiClient:
    """Client for Kie.ai Sora video generation API"""
    
    BASE_URL = "https://api.kie.ai/api"
    
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
    
    async def create_task(
        self,
        prompt: str,
        image_url: str,
        aspect_ratio: str = "portrait",
        n_frames: str = "10",
        remove_watermark: bool = True
    ) -> Dict[str, Any]:
        """
        Create a new video generation task
        
        Args:
            prompt: The generation prompt
            image_url: URL to the reference image
            aspect_ratio: "portrait" or "landscape"
            n_frames: Number of frames "10" or "15"
            remove_watermark: Whether to remove watermark
            
        Returns:
            Dict with task_id or error
        """
        payload = {
            "model": "sora-2-image-to-video",
            "input": {
                "prompt": prompt,
                "image_urls": [image_url],
                "aspect_ratio": aspect_ratio,
                "n_frames": n_frames,
                "remove_watermark": remove_watermark
            }
        }
        
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(
                    f"{self.BASE_URL}/v1/jobs/createTask",
                    json=payload,
                    headers=self.headers
                )
                response.raise_for_status()
                data = response.json()
                logger.info(f"Kie.ai createTask raw response: {data}")
                
                if not data or not isinstance(data, dict):
                    return {"success": False, "error": "Empty or invalid response from Kie.ai"}
                
                # Extract task_id from response (may be nested in data)
                task_data = data.get("data") or data
                task_id = task_data.get("taskId") or task_data.get("task_id") or task_data.get("id")
                
                if not task_id:
                    logger.error(f"No task_id found in Kie.ai response: {data}")
                    return {
                        "success": False,
                        "error": f"Kie.ai returned no task ID. Response: {str(data)[:200]}"
                    }
                
                return {
                    "success": True,
                    "task_id": task_id,
                    "status": "queued"
                }
                
        except httpx.HTTPStatusError as e:
            error_detail = e.response.text[:200] if e.response.text else "No details"
            logger.error(f"Kie.ai API error: {e.response.status_code} - {error_detail}")
            return {
                "success": False,
                "error": f"Kie.ai API Error ({e.response.status_code}): {error_detail}",
                "detail": e.response.text
            }
        except Exception as e:
            logger.error(f"Kie.ai request failed: {str(e)}")
            return {
                "success": False,
                "error": str(e)
            }
    
    async def get_task_status(self, task_id: str) -> Dict[str, Any]:
        """
        Get the status of a video generation task
        
        Args:
            task_id: The task ID to check
            
        Returns:
            Dict with status, progress, and video URL if completed
        """
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.get(
                    f"{self.BASE_URL}/v1/jobs/recordInfo",
                    params={"taskId": task_id},
                    headers=self.headers
                )
                response.raise_for_status()
                data = response.json()
                
                if not data or not isinstance(data, dict):
                    return {
                        "success": False, "task_id": task_id,
                        "status": "failed", "error": "Empty or invalid response from Kie.ai"
                    }
                
                # API may wrap data in a "data" field
                task_data = data.get("data") or data
                
                # Map API state to our status
                api_state = task_data.get("state", "").lower()
                status_map = {
                    "waiting": "pending",
                    "queuing": "queued",
                    "generating": "processing",
                    "success": "completed",
                    "fail": "failed"
                }
                
                status = status_map.get(api_state, "pending")
                progress = task_data.get("progress", 0)
                
                # Estimate progress based on status if not provided
                if progress == 0:
                    if status == "queued":
                        progress = 5
                    elif status == "processing":
                        progress = 50
                    elif status == "completed":
                        progress = 100
                
                result = {
                    "success": True,
                    "task_id": task_id,
                    "status": status,
                    "progress": progress
                }
                
                if status == "completed":
                    # Parse resultJson string to extract video URLs
                    result_json_str = task_data.get("resultJson", "")
                    if result_json_str:
                        try:
                            result_json = json.loads(result_json_str)
                            urls = result_json.get("resultUrls", [])
                            result["video_url"] = urls[0] if urls else None
                        except (json.JSONDecodeError, IndexError):
                            result["video_url"] = None
                            logger.warning(f"Failed to parse resultJson: {result_json_str[:200]}")
                    result["thumbnail_url"] = None
                
                if status == "failed":
                    result["error"] = task_data.get("failMsg") or task_data.get("failCode") or "Generation failed"
                
                return result
                
        except httpx.HTTPStatusError as e:
            logger.error(f"Status check error: {e.response.status_code}")
            return {
                "success": False,
                "task_id": task_id,
                "status": "failed",
                "error": f"API Error: {e.response.status_code}"
            }
        except Exception as e:
            logger.error(f"Status check failed: {str(e)}")
            return {
                "success": False,
                "task_id": task_id,
                "status": "failed",
                "error": str(e)
            }
    
    async def get_credit_balance(self) -> Dict[str, Any]:
        """Get current API credit balance"""
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                # Endpoint: https://api.kie.ai/api/v1/chat/credit
                response = await client.get(
                    f"{self.BASE_URL}/v1/chat/credit",
                    headers=self.headers
                )
                response.raise_for_status()
                data = response.json()
                
                # Response format: { "code": 200, "msg": "success", "data": 100 }
                credits = data.get("data", 0)
                
                return {
                    "success": True,
                    "credits": credits
                }
                
        except Exception as e:
            logger.error(f"Credit check failed: {str(e)}")
            return {
                "success": False,
                "error": str(e)
            }

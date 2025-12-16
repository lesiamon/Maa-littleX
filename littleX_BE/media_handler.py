"""
Media handler for processing multipart form data and managing media files.
"""

import os
from pathlib import Path

# Media directory configuration
MEDIA_DIR = os.getenv("MEDIA_DIR", "media")

# Ensure media directory exists
Path(MEDIA_DIR).mkdir(exist_ok=True)


def process_multipart_create_tweet(form_data):
    """
    Process multipart form data from create_tweet endpoint.
    
    Args:
        form_data: FastAPI form data object
        
    Returns:
        dict: Processed payload with content, username, and media list
    """
    try:
        # FastAPI FormData is a starlette FormData object that acts like a dict
        payload = {
            "content": form_data.get("content") or "",
            "username": form_data.get("username") or "anon",
            "media": []
        }
        
        # Process any uploaded files
        if "file" in form_data:
            file = form_data["file"]
            if file and hasattr(file, "filename") and file.filename:
                payload["media"].append(file.filename)
        
        return payload
    except Exception as e:
        print(f"Error processing multipart data: {e}")
        import traceback
        traceback.print_exc()
        return {
            "content": "",
            "username": "anon",
            "media": []
        }

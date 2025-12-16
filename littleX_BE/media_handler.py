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
        payload = {
            "content": getattr(form_data, "content", ""),
            "username": getattr(form_data, "username", "anon"),
            "media": []
        }
        
        # Process any uploaded files
        if hasattr(form_data, "media") and form_data.media:
            files = form_data.media if isinstance(form_data.media, list) else [form_data.media]
            for file in files:
                if file and file.filename:
                    payload["media"].append(file.filename)
        
        return payload
    except Exception as e:
        print(f"Error processing multipart data: {e}")
        return {
            "content": "",
            "username": "anon",
            "media": []
        }

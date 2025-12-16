import os
import json
import base64
import uuid
import secrets
import time
from pathlib import Path
from typing import Optional, List
from datetime import datetime, timezone
from contextlib import asynccontextmanager
from dotenv import load_dotenv

# Load environment variables from .env file
env_path = Path(__file__).parent / ".env"
load_dotenv(dotenv_path=env_path)

from fastapi import FastAPI, Request, Form, File, UploadFile, HTTPException, Body
from fastapi.responses import JSONResponse, FileResponse, StreamingResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from fastapi.encoders import jsonable_encoder
import uvicorn
import requests
import httpx  # For async HTTP calls

from media_handler import process_multipart_create_tweet, MEDIA_DIR

# Configuration
PORT = int(os.getenv("PORT", "8000"))
JAC_FILE = "littleX.jac"

# In-memory storage
tweets = []
users = {}

def generate_token(username):
    """Simple token generation (not secure, for demo only)."""
    return secrets.token_hex(16) + username

# Initialize with lifespan context manager (replaces deprecated @app.on_event)
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialize on startup and cleanup on shutdown."""
    print(f"Starting littleX Backend Server on port {PORT}")
    init_jaseci()
    yield
    # Cleanup on shutdown if needed
    pass

app = FastAPI(title="littleX Backend", lifespan=lifespan)


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Return a 422 response with safely encoded error details."""
    def replace_bytes(o):
        if isinstance(o, dict):
            return {k: replace_bytes(v) for k, v in o.items()}
        if isinstance(o, list):
            return [replace_bytes(i) for i in o]
        if isinstance(o, (bytes, bytearray)):
            return base64.b64encode(o).decode("ascii")
        return o

    try:
        detail = jsonable_encoder(exc.errors())
    except Exception:
        detail = replace_bytes(exc.errors())

    return JSONResponse(status_code=422, content={"detail": detail})

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve media files statically
app.mount("/media", StaticFiles(directory=str(MEDIA_DIR)), name="media")

# Global Jaseci connector
jaseci_connector = None

def init_jaseci():
    """Initialize Jaseci connector."""
    global jaseci_connector
    try:
        from jac_cloud.jaseci import JaseciConnector
        jaseci_connector = JaseciConnector()
        print("✓ Jaseci connector initialized")
        return True
    except Exception as e:
        print(f"Error initializing Jaseci: {e}")
        return False

def run_walker(walker_name: str, payload: dict) -> dict:
    """Execute a walker with the given payload."""
    try:
        if walker_name == "create_tweet":
            # Get username from payload or use default
            username = payload.get("username", "guest")
            
            tweet = {
                "id": str(uuid.uuid4()),
                "content": payload.get("content", ""),
                "media": payload.get("media", []),
                "created_at": datetime.now(timezone.utc).isoformat(),
                "username": username,
                "comments": [],
                "likes": []
            }
            tweets.insert(0, tweet)
            return {"reports": [[{"context": tweet}]]}
        elif walker_name == "load_feed":
            return {"reports": [[{"context": t} for t in tweets]]}
        elif walker_name == "get_profile":
            # Return mock user profile
            username = payload.get("username", "guest")
            profile = {
                "user": {"username": username},
                "following": [],
                "followers": []
            }
            return {"reports": [[{"context": profile}]]}
        else:
            return {"error": f"Unknown walker: {walker_name}"}
    except Exception as e:
        print(f"Error running walker {walker_name}: {e}")
        return {"error": str(e)}

# === User Endpoints ===

@app.post("/user/register")
async def user_register(payload: dict = Body(...)):
    return JSONResponse(status_code=403, content={"error": "Registration is disabled"})

@app.post("/user/login")
async def user_login(payload: dict = Body(...)):
    return JSONResponse(status_code=403, content={"error": "Login is disabled"})

# === Walker Endpoints ===

@app.post("/walker/create_tweet")
async def create_tweet(request: Request):
    """Handle POST to /walker/create_tweet with multipart form-data or JSON support."""
    try:
        # Check content type
        content_type = request.headers.get("content-type", "")
        
        payload = {}
        if "multipart/form-data" in content_type:
            # Handle multipart form data (with files)
            form_data = await request.form()
            payload = process_multipart_create_tweet(form_data)
        elif "application/json" in content_type:
            # Handle JSON
            payload = await request.json()
        else:
            # Try form data by default
            form_data = await request.form()
            payload = process_multipart_create_tweet(form_data)
        
        print(f"Create tweet payload: content={payload.get('content', '')[:50]}..., media_count={len(payload.get('media', []))}")
        
        result = run_walker("create_tweet", payload)
        return JSONResponse(status_code=200, content=result)
        
    except Exception as e:
        print(f"Error in create_tweet: {e}")
        import traceback
        traceback.print_exc()
        return JSONResponse(
            status_code=500,
            content={"error": str(e), "type": type(e).__name__}
        )

@app.post("/walker/load_feed")
async def load_feed(request: Request):
    """Load all tweets from feed."""
    try:
        payload = await request.json() if request.headers.get("content-type", "").startswith("application/json") else {}
        result = run_walker("load_feed", payload)
        return JSONResponse(status_code=200, content=result)
    except Exception as e:
        print(f"Error in load_feed: {e}")
        import traceback
        traceback.print_exc()
        return JSONResponse(
            status_code=500,
            content={"error": str(e), "type": type(e).__name__}
        )

@app.post("/walker/get_profile")
async def get_profile(request: Request):
    """Get user profile."""
    try:
        payload = await request.json() if request.headers.get("content-type", "").startswith("application/json") else {}
        result = run_walker("get_profile", payload)
        return JSONResponse(status_code=200, content=result)
    except Exception as e:
        print(f"Error in get_profile: {e}")
        import traceback
        traceback.print_exc()
        return JSONResponse(
            status_code=500,
            content={"error": str(e), "type": type(e).__name__}
        )

@app.post("/walker/like_tweet/{tweet_id}")
async def like_tweet(tweet_id: str, request: Request):
    """Like a tweet."""
    try:
        payload = await request.json() if request.headers.get("content-type", "").startswith("application/json") else {}
        payload["tweet_id"] = tweet_id
        
        # Find tweet and add username to likes
        for tweet in tweets:
            if tweet["id"] == tweet_id:
                username = payload.get("username", "anon")
                if username not in tweet.get("likes", []):
                    tweet["likes"].append(username)
                return JSONResponse(status_code=200, content={"reports": [[{"context": tweet}]]})
        
        return JSONResponse(status_code=404, content={"error": "Tweet not found"})
    except Exception as e:
        print(f"Error in like_tweet: {e}")
        import traceback
        traceback.print_exc()
        return JSONResponse(
            status_code=500,
            content={"error": str(e), "type": type(e).__name__}
        )

@app.post("/walker/remove_like/{tweet_id}")
async def remove_like(tweet_id: str, request: Request):
    """Remove like from a tweet."""
    try:
        payload = await request.json() if request.headers.get("content-type", "").startswith("application/json") else {}
        
        # Find tweet and remove username from likes
        for tweet in tweets:
            if tweet["id"] == tweet_id:
                username = payload.get("username", "anon")
                if username in tweet.get("likes", []):
                    tweet["likes"].remove(username)
                return JSONResponse(status_code=200, content={"reports": [[{"context": tweet}]]})
        
        return JSONResponse(status_code=404, content={"error": "Tweet not found"})
    except Exception as e:
        print(f"Error in remove_like: {e}")
        import traceback
        traceback.print_exc()
        return JSONResponse(
            status_code=500,
            content={"error": str(e), "type": type(e).__name__}
        )

@app.post("/walker/comment_tweet/{tweet_id}")
async def comment_tweet(tweet_id: str, request: Request):
    """Add a comment to a tweet."""
    try:
        # Get JSON or FormData
        if request.headers.get("content-type", "").startswith("application/json"):
            payload = await request.json()
        else:
            form = await request.form()
            payload = dict(form)
        
        content = payload.get("content", "").strip()
        username = payload.get("username", "anon")
        
        if not content:
            return JSONResponse(status_code=400, content={"error": "Comment content required"})
        
        # Find tweet and add comment
        for tweet in tweets:
            if tweet["id"] == tweet_id:
                comment_id = f"comment_{len(tweet['comments'])}_{int(time.time())}"
                comment = {
                    "id": comment_id,
                    "username": username,
                    "content": content,
                    "created_at": datetime.utcnow().isoformat(),
                    "likes": []
                }
                tweet["comments"].append(comment)
                return JSONResponse(status_code=200, content={"reports": [[{"context": tweet}]]})
        
        return JSONResponse(status_code=404, content={"error": "Tweet not found"})
    except Exception as e:
        print(f"Error in comment_tweet: {e}")
        import traceback
        traceback.print_exc()
        return JSONResponse(
            status_code=500,
            content={"error": str(e), "type": type(e).__name__}
        )

@app.post("/walker/remove_comment/{comment_id}")
async def remove_comment(comment_id: str, request: Request):
    """Remove a comment from a tweet."""
    try:
        # Get JSON payload
        if request.headers.get("content-type", "").startswith("application/json"):
            payload = await request.json()
        else:
            payload = {}
        
        tweet_id = payload.get("tweet_id")
        
        # Find tweet and remove comment
        for tweet in tweets:
            if tweet["id"] == tweet_id:
                # Find and remove the comment
                for i, comment in enumerate(tweet["comments"]):
                    if comment["id"] == comment_id:
                        removed = tweet["comments"].pop(i)
                        return JSONResponse(status_code=200, content={"reports": [[{"context": tweet, "removed": removed}]]})
                
                return JSONResponse(status_code=404, content={"error": "Comment not found"})
        
        return JSONResponse(status_code=404, content={"error": "Tweet not found"})
    except Exception as e:
        print(f"Error in remove_comment: {e}")
        import traceback
        traceback.print_exc()
        return JSONResponse(
            status_code=500,
            content={"error": str(e), "type": type(e).__name__}
        )

# === Assistant Endpoints ===

async def call_deepseek_api(prompt: str, system_message: str = "You are a helpful assistant.") -> str:
    """Call DeepSeek API asynchronously with proper error handling."""
    DEEPSEEK_API_KEY = os.getenv("DEEPSEEK_API_KEY")
    
    if not DEEPSEEK_API_KEY:
        print("Warning: DEEPSEEK_API_KEY not set. Using mock responses.")
        return "[Mock Response] " + prompt[:100]
    
    try:
        headers = {
            "Authorization": f"Bearer {DEEPSEEK_API_KEY}",
            "Content-Type": "application/json"
        }
        
        data = {
            "model": "deepseek-chat",
            "messages": [
                {"role": "system", "content": system_message},
                {"role": "user", "content": prompt}
            ],
            "temperature": 0.7,
            "max_tokens": 500
        }
        
        # Use async HTTP client
        async with httpx.AsyncClient(timeout=15) as client:
            response = await client.post(
                "https://api.deepseek.com/chat/completions",
                headers=headers,
                json=data
            )
        
        if response.status_code == 200:
            result = response.json()
            return result["choices"][0]["message"]["content"].strip()
        else:
            print(f"DeepSeek API error: {response.status_code} - {response.text}")
            return f"[Error] Could not process request (Status: {response.status_code})"
            
    except Exception as e:
        print(f"Error calling DeepSeek API: {e}")
        return f"[Error] Failed to call AI: {str(e)}"


# Backward compatibility alias
call_gpt_api = call_deepseek_api

async def extract_articles_gpt(text: str) -> List[dict]:
    """Use GPT to extract article references from text."""
    import re
    
    # First, find obvious URLs
    articles = []
    url_pattern = r'https?://[^\s]+'
    urls = re.findall(url_pattern, text)
    
    for url in urls:
        articles.append({
            "type": "article",
            "url": url,
            "source": url.split('/')[2] if '://' in url else "Unknown",
            "title": f"Article from {url.split('/')[2]}" if '://' in url else "Article"
        })
    
    # Use GPT to identify article mentions
    if len(articles) == 0 or "article" in text.lower():
        prompt = f"""Extract article mentions from this text. Return as JSON array with objects containing 'topic' and 'title' fields.
Text: "{text}"

Return only JSON array, no other text."""
        
        response = await call_gpt_api(
            prompt,
            "You are an AI that extracts article references from text. Return only valid JSON."
        )
        
        try:
            # Try to parse JSON response
            if response.startswith("["):
                gpt_articles = json.loads(response)
                for article in gpt_articles:
                    articles.append({
                        "type": "article",
                        "topic": article.get("topic", "Unknown"),
                        "title": article.get("title", "Article"),
                        "description": f"Mentioned article about {article.get('topic', 'Unknown')}"
                    })
        except:
            pass  # If JSON parsing fails, just use URLs
    
    return articles

async def extract_products_gpt(text: str) -> List[dict]:
    """Use GPT to extract products/clothing mentions from text with keyword fallback."""
    # Keyword fallback detection
    product_keywords = [
        "iphone", "android", "samsung", "pixel", "watch", "airpods", "headphones",
        "laptop", "computer", "macbook", "dell", "hp", "lenovo",
        "nike", "adidas", "puma", "reebok", "shoes", "sneakers", "boots",
        "dress", "shirt", "pants", "jacket", "coat", "sweater", "hoodie",
        "amazon", "ebay", "shopify", "store", "shop", "mall",
        "apple", "google", "microsoft", "tesla", "amazon", "meta",
        "starbucks", "mcdonald", "pizza", "burger", "coffee", "tea",
        "netflix", "spotify", "disney", "youtube", "tiktok", "instagram"
    ]
    
    text_lower = text.lower()
    products = []
    detected_products = set()
    
    # Keyword-based detection
    for keyword in product_keywords:
        if keyword in text_lower and keyword not in detected_products:
            products.append({
                "type": "product",
                "name": keyword.title(),
                "category": "detected",
                "context": text[:100]
            })
            detected_products.add(keyword)
    
    # Try GPT if available
    prompt = f"""Identify all products, clothing items, and accessories mentioned in this text.
Return as JSON array with objects containing: name, category (clothing/accessory/electronics/other), and context.
Text: "{text}"

Return ONLY valid JSON array, no other text."""
    
    try:
        response = await call_gpt_api(
            prompt,
            "You extract product mentions from text. Return only valid JSON array."
        )
        
        if response and response.startswith("["):
            gpt_products = json.loads(response)
            for product in gpt_products:
                products.append({
                    "type": "product",
                    "name": product.get("name", "Unknown"),
                    "category": product.get("category", "other"),
                    "context": product.get("context", "")[:100]
                })
    except:
        pass  # Use keyword detection only
    
    return products

async def extract_places_gpt(text: str) -> List[dict]:
    """Use GPT to extract place/location mentions from text with keyword fallback."""
    # Keyword fallback detection
    place_keywords = [
        "paris", "london", "tokyo", "new york", "la", "los angeles", "tokyo", "dubai", "singapore",
        "france", "uk", "japan", "usa", "china", "india", "brazil", "germany", "spain", "italy",
        "restaurant", "cafe", "bar", "hotel", "airport", "station", "mall", "store", "museum",
        "central park", "eiffel tower", "big ben", "statue of liberty", "taj mahal",
        "brooklyn", "manhattan", "chicago", "miami", "boston", "seattle", "denver",
        "street", "avenue", "boulevard", "city", "town", "village", "beach", "mountain", "lake"
    ]
    
    text_lower = text.lower()
    places = []
    detected_places = set()
    
    # Keyword-based detection
    for keyword in place_keywords:
        if keyword in text_lower and keyword not in detected_places:
            places.append({
                "type": "place",
                "name": keyword.title(),
                "category": "location",
                "context": text[:100]
            })
            detected_places.add(keyword)
    
    # Try GPT if available
    prompt = f"""Identify all places, locations, venues mentioned in this text.
Return as JSON array with objects containing: name, category (restaurant/shopping/landmark/accommodation/transportation), and context.
Text: "{text}"

Return ONLY valid JSON array, no other text."""
    
    try:
        response = await call_gpt_api(
            prompt,
            "You extract place mentions from text. Return only valid JSON array."
        )
        
        if response and response.startswith("["):
            gpt_places = json.loads(response)
            for place in gpt_places:
                places.append({
                    "type": "place",
                    "name": place.get("name", "Unknown"),
                    "category": place.get("category", "landmark"),
                    "context": place.get("context", "")[:100]
                })
    except:
        pass  # Use keyword detection only
    
    return places

@app.post("/assistant/explain")
async def assistant_explain(payload: dict = Body(...)):
    """Explain or translate the given text to the target language using GPT AI."""
    text = payload.get("text", "")
    language = payload.get("language", "en")
    
    if not text:
        return {"error": "No text provided"}
    
    # Use GPT to extract articles, products, and places
    articles = await extract_articles_gpt(text)
    products = await extract_products_gpt(text)
    places = await extract_places_gpt(text)
    
    # Use GPT to explain/translate the text
    if language == "en":
        explanation_prompt = f"Briefly explain this text in 2-3 sentences:\n{text}"
    else:
        explanation_prompt = f"Translate and explain this text to {language} in 2-3 sentences:\n{text}"
    
    explanation = await call_gpt_api(
        explanation_prompt,
        f"You are a helpful assistant. Respond in {language}."
    )
    
    # Build response with all extracted info
    response = {
        "explanation": explanation,
        "articles": articles,
        "products": products,
        "places": places,
        "detected": {
            "has_articles": len(articles) > 0,
            "has_products": len(products) > 0,
            "has_places": len(places) > 0
        }
    }
    
    return response

@app.post("/assistant/image-info")
async def assistant_image_info(payload: dict = Body(...)):
    """Analyze image for products, places, and other information using GPT."""
    image_url = payload.get("imageUrl", "")
    
    if not image_url:
        return {"error": "No image URL provided"}
    
    OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
    
    if OPENAI_API_KEY:
        try:
            # Use GPT-4 Vision if available, fallback to standard model
            headers = {
                "Authorization": f"Bearer {OPENAI_API_KEY}",
                "Content-Type": "application/json"
            }
            
            # Try GPT-4 Vision first (if available with your API key)
            vision_data = {
                "model": "gpt-4-vision-preview",
                "messages": [
                    {
                        "role": "user",
                        "content": [
                            {"type": "text", "text": "Analyze this image and identify: 1) Products/clothing items visible, 2) Places/locations, 3) General description. Return as JSON with 'products', 'places', and 'description' keys."},
                            {"type": "image_url", "image_url": {"url": image_url}}
                        ]
                    }
                ],
                "max_tokens": 1024
            }
            
            response = requests.post(
                "https://api.openai.com/v1/chat/completions",
                headers=headers,
                json=vision_data,
                timeout=30
            )
            
            if response.status_code == 200:
                result = response.json()
                analysis_text = result["choices"][0]["message"]["content"]
                
                # Try to parse as JSON
                try:
                    if "{" in analysis_text:
                        json_start = analysis_text.index("{")
                        json_end = analysis_text.rindex("}") + 1
                        analysis = json.loads(analysis_text[json_start:json_end])
                        
                        return {
                            "info": analysis.get("description", "Image analysis completed"),
                            "detected_products": analysis.get("products", []),
                            "detected_places": analysis.get("places", []),
                            "suggestions": ["More details available for identified items"]
                        }
                except:
                    # Fallback: return text analysis
                    return {
                        "info": analysis_text,
                        "detected_products": [],
                        "detected_places": [],
                        "suggestions": ["Request a new analysis for more details"]
                    }
            else:
                # Fallback to text-based analysis
                text_data = {
                    "model": "gpt-3.5-turbo",
                    "messages": [
                        {"role": "user", "content": f"Based on this image URL ({image_url}), what products and places might be visible? Describe in 2-3 sentences."}
                    ],
                    "max_tokens": 500
                }
                
                response = requests.post(
                    "https://api.openai.com/v1/chat/completions",
                    headers=headers,
                    json=text_data,
                    timeout=15
                )
                
                if response.status_code == 200:
                    result = response.json()
                    analysis = result["choices"][0]["message"]["content"]
                    return {
                        "info": analysis,
                        "detected_products": [],
                        "detected_places": [],
                        "suggestions": ["Upload a higher quality image for better analysis"]
                    }
                
        except Exception as e:
            print(f"Error in image analysis: {e}")
            return {
                "info": f"Could not analyze image: {str(e)}",
                "detected_products": [],
                "detected_places": [],
                "suggestions": ["Try uploading a different image"]
            }
    
    # Fallback mock response if no API key
    return {
        "info": "Image analysis unavailable (OpenAI API key not configured)",
        "detected_products": [
            {"name": "Unknown Item", "confidence": 0.5}
        ],
        "detected_places": [
            {"name": "Unknown Location", "confidence": 0.4}
        ],
        "suggestions": [
            "Configure OPENAI_API_KEY for image analysis",
            "Upload to Google Images for reverse product search",
            "Use Google Lens for place identification"
        ]
    }

@app.post("/assistant/recommend")
async def assistant_recommend(payload: dict = Body(...)):
    """Recommend articles based on context using GPT AI."""
    context = payload.get("context", "")
    
    if not context:
        return {"articles": []}
    
    prompt = f"""Based on this context: "{context}"
    
Recommend 3 relevant articles. For each, provide:
- title: Article title
- source: Publication name
- url: https://example.com/article

Return as JSON array with these fields. Return ONLY JSON, no other text."""
    
    response = await call_gpt_api(
        prompt,
        "You recommend relevant articles. Return only valid JSON array."
    )
    
    articles = []
    try:
        if response.startswith("["):
            recommendations = json.loads(response)
            articles = recommendations
    except:
        # Fallback to generic recommendations
        articles = [
            {"title": "How to find quality products online", "source": "StyleGuide", "url": "https://example.com/1"},
            {"title": "Restaurant guide for food lovers", "source": "EatWell", "url": "https://example.com/2"},
            {"title": "Travel tips and recommendations", "source": "TravelBlog", "url": "https://example.com/3"},
        ]
    
    return {"articles": articles, "context_analyzed": context}

# === Tweet Summary Function ===

async def generate_tweet_summary(text: str) -> str:
    """Generate a concise summary of the tweet content using GPT."""
    prompt = f"""Provide a brief, insightful summary of this tweet in 1-2 sentences. Be concise and highlight the main point.

Tweet: "{text}"

Summary:"""
    
    response = await call_gpt_api(
        prompt,
        "You are an AI that creates concise, insightful summaries of tweets."
    )
    
    # If GPT fails (contains [Error]) or returns empty, use keyword-based summary
    if not response or response.strip() == "" or "[Error]" in response:
        # Create a simple summary from keywords - take first sentence or first 100 chars
        text_clean = text.strip()
        if len(text_clean) > 150:
            # Take first sentence or first 150 chars
            sentences = text_clean.split('.')
            if len(sentences) > 0 and len(sentences[0]) > 0:
                summary = sentences[0].strip() + "..."
            else:
                summary = text_clean[:150] + "..."
        else:
            summary = text_clean
        return summary
    
    return response.strip()

# === Tweet Analysis Endpoint ===

@app.post("/assistant/analyze_tweet")
async def analyze_tweet(request: Request):
    """Analyze tweet content for articles, products, and places using GPT."""
    try:
        content_type = request.headers.get("content-type", "")
        payload = {}
        
        if "application/json" in content_type:
            payload = await request.json()
        else:
            # Try to parse as JSON anyway
            try:
                body = await request.body()
                payload = json.loads(body) if body else {}
            except:
                payload = {}
        
        tweet_content = payload.get("content", "")
        
        if not tweet_content:
            return JSONResponse(
                status_code=400,
                content={"error": "No tweet content provided"}
            )
        
        # Generate summary using GPT
        summary = await generate_tweet_summary(tweet_content)
        
        return JSONResponse(
            status_code=200,
            content={
                "summary": summary,
                "content_analyzed": tweet_content
            }
        )
    except Exception as e:
        print(f"Error analyzing tweet: {e}")
        import traceback
        traceback.print_exc()
        return JSONResponse(
            status_code=500,
            content={"error": str(e), "type": type(e).__name__}
        )

# === Health & Status Endpoints ===

@app.get("/health")
async def health():
    """Health check endpoint."""
    return {"status": "ok", "media_dir": str(MEDIA_DIR)}


if __name__ == "__main__":
    print(f"littleX Backend Server")
    print(f"Port: {PORT}")
    print(f"Media Directory: {MEDIA_DIR}")
    print(f"Jac File: {JAC_FILE}")
    
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=PORT,
        log_level="info"
    )

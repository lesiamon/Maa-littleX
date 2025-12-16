# AI-Powered Smart Assistant - Setup & Testing Guide

## Overview

The LittleX Smart Assistant now uses **GPT AI** (OpenAI API) for intelligent detection and explanations. Instead of regex patterns, it now:

1. **Uses GPT-3.5-turbo or GPT-4** for understanding context
2. **Detects articles, products, and places** with AI understanding
3. **Provides intelligent explanations** in any language
4. **Analyzes images** using GPT-4 Vision (if available)
5. **Gives recommendations** based on context

## Setup Instructions

### Step 1: Get OpenAI API Key

1. Go to [OpenAI Platform](https://platform.openai.com/api-keys)
2. Sign up or log in
3. Create a new API key
4. Copy the key (it starts with `sk-`)

### Step 2: Set Environment Variable

#### Option A: Add to `.env` file in littleX_BE/
```bash
cd /home/lesi/lesi/projects/Maa-littleX/littleX_BE
echo "OPENAI_API_KEY=sk-your-key-here" > .env
```

#### Option B: Set in terminal before running
```bash
export OPENAI_API_KEY="sk-your-key-here"
cd /home/lesi/lesi/projects/Maa-littleX/littleX_BE
python3 run_server.py
```

#### Option C: Set in system environment
```bash
# Add to ~/.bashrc or ~/.zshrc
export OPENAI_API_KEY="sk-your-key-here"

# Then reload
source ~/.bashrc  # or source ~/.zshrc
```

### Step 3: Verify Setup

```bash
# Check if key is loaded
python3 -c "import os; print('Key set:', bool(os.getenv('OPENAI_API_KEY')))"

# Or check in the backend logs
tail -20 /tmp/backend.log
```

## Test the AI Assistant

### Test 1: Text Explanation & Detection

```bash
curl -X POST http://localhost:8000/assistant/explain \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Check out this amazing article about AI at https://ai.example.com/guide. I need a new laptop and some nice shoes. Lets meet at the coffee shop downtown!",
    "language": "en"
  }' | python3 -m json.tool
```

**Expected Response:**
```json
{
  "explanation": "AI-generated explanation of the text in English",
  "articles": [
    {
      "type": "article",
      "url": "https://ai.example.com/guide",
      "source": "ai.example.com",
      "title": "Article from ai.example.com"
    }
  ],
  "products": [
    {
      "type": "product",
      "name": "laptop",
      "category": "electronics"
    },
    {
      "type": "product",
      "name": "shoes",
      "category": "clothing"
    }
  ],
  "places": [
    {
      "type": "place",
      "name": "coffee shop",
      "category": "restaurant"
    }
  ],
  "detected": {
    "has_articles": true,
    "has_products": true,
    "has_places": true
  }
}
```

### Test 2: Multi-Language Support

```bash
# Spanish explanation
curl -X POST http://localhost:8000/assistant/explain \
  -H "Content-Type: application/json" \
  -d '{
    "text": "I love going to restaurants and shopping malls",
    "language": "es"
  }' | python3 -m json.tool
```

### Test 3: Article Recommendations

```bash
curl -X POST http://localhost:8000/assistant/recommend \
  -H "Content-Type: application/json" \
  -d '{
    "context": "I like fashion and technology"
  }' | python3 -m json.tool
```

## AI Models Used

### Primary Model: GPT-3.5-turbo
- **Cost**: ~$0.0005 per 1K input tokens
- **Speed**: Very fast (< 1 second)
- **Capability**: Excellent for text understanding and extraction
- **Used for**: Text explanation, product/place/article detection, recommendations

### Optional Model: GPT-4 Vision (for images)
- **Cost**: ~$0.01 per 1K tokens + image processing
- **Speed**: Slower but very accurate
- **Capability**: Can analyze images to detect products and places
- **Used for**: Image analysis endpoint
- **Requirement**: Image must be accessible via URL

### Fallback: GPT-4 (alternative)
- **Cost**: ~$0.003 per 1K tokens
- **Speed**: Slower but higher quality
- **Capability**: Better understanding for complex requests
- **Used for**: As fallback if specified in env var

## Cost Estimation

For typical usage:

| Feature | Tokens | Cost |
|---------|--------|------|
| Single explanation | 200-300 | $0.0001-0.0002 |
| Product detection | 100-200 | $0.00005-0.0001 |
| Place detection | 100-150 | $0.00005-0.00008 |
| Image analysis | 500-1000 | $0.0005-0.001 |
| 1000 explanations/day | 250,000 | ~$0.10-0.15 |

**Tip**: Set API usage limits on OpenAI dashboard to avoid unexpected charges.

## Features When AI is Enabled

### ✅ Smart Text Understanding
Instead of simple keyword matching, GPT understands context:
- "I got a blue Nike shirt" → Detects "shirt" with context "blue Nike"
- "Let's meet at Starbucks" → Detects "Starbucks" as a place type "coffee"
- "Read this Forbes article" → Identifies article even without URL

### ✅ Accurate Explanations
- Explains text in any language
- Understands complex sentences
- Provides meaningful summaries
- Handles slang and informal language

### ✅ Image Analysis
- With GPT-4 Vision: Identify products in photos
- Detect locations in images
- Extract text from images (OCR)
- Describe what's happening in images

### ✅ Smart Recommendations
- Gives relevant article suggestions based on conversation context
- Understands user interests from text
- Provides personalized recommendations

## Fallback Behavior (Without API Key)

If `OPENAI_API_KEY` is not set:
- ✅ Assistant still works
- ⚠️ Returns `[Mock Response]` for explanations
- ⚠️ Cannot detect articles/products/places (requires AI)
- ⚠️ Image analysis returns mock data
- ℹ️ Useful for testing UI without costs

## Environment Variable Examples

### .env file format
```bash
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxx
PORT=8000
```

### Docker environment
```dockerfile
FROM python:3.10
ENV OPENAI_API_KEY=sk-xxxxx
```

### Kubernetes secret
```yaml
apiVersion: v1
kind: Secret
metadata:
  name: littlex-secrets
type: Opaque
stringData:
  OPENAI_API_KEY: sk-xxxxx
```

## Troubleshooting

### Issue: "OPENAI_API_KEY not set"
**Solution**: 
```bash
export OPENAI_API_KEY="sk-your-key"
# Restart backend
pkill -f "python3 run_server.py"
cd /home/lesi/lesi/projects/Maa-littleX/littleX_BE
python3 run_server.py
```

### Issue: "401 Unauthorized"
**Solution**: Check that your API key is correct and has credits

### Issue: "Rate limit exceeded"
**Solution**: Upgrade your OpenAI account or implement request throttling

### Issue: "Timeout - request took too long"
**Solution**: 
- Check internet connection
- OpenAI API might be slow
- Try with simpler text

### Issue: GPT returns invalid JSON
**Solution**: Backend has fallback - extracts what it can from the response

## Testing on Frontend

1. Start both services:
```bash
# Terminal 1
cd littleX_BE && python3 run_server.py

# Terminal 2
cd littleX_FE && npm run dev
```

2. Go to http://localhost:3001

3. Post a comment with:
   - Article URL: `https://example.com/article`
   - Product name: `laptop`, `shoes`, `shirt`
   - Place: `cafe`, `restaurant`, `mall`, `museum`

4. Click the **[✨]** sparkles button next to comment

5. You should see:
   - ✅ AI-generated explanation
   - ✅ Detected articles with links
   - ✅ Detected products with categories
   - ✅ Detected places with types

## Cost Optimization Tips

1. **Cache results** - Don't re-analyze same text
2. **Batch requests** - Combine multiple items
3. **Use GPT-3.5** - Cheaper than GPT-4 for most tasks
4. **Set token limits** - Max 500 tokens per request
5. **Monitor usage** - Check OpenAI dashboard regularly

## API Endpoints Reference

### POST /assistant/explain
Explains text and detects articles, products, places

### POST /assistant/image-info
Analyzes images (requires GPT-4 Vision access)

### POST /assistant/recommend
Recommends articles based on context

All endpoints require:
- `Content-Type: application/json`
- Valid request body with required fields

## Next Steps

1. Get an OpenAI API key
2. Set `OPENAI_API_KEY` environment variable
3. Restart backend
4. Test with the commands above
5. Enjoy AI-powered content detection!

---

**Note**: The assistant will work without an API key (using mock responses), but AI features require OpenAI API access.


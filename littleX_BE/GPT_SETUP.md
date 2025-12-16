# LittleX Environment Configuration

## OpenAI API Setup

### Step 1: Get Your API Key
1. Go to https://platform.openai.com/api/keys
2. Sign in with your OpenAI account
3. Click "Create new secret key"
4. Copy the key (save it securely)

### Step 2: Add to Environment

Create a `.env` file in the `littleX_BE` directory with:

```
OPENAI_API_KEY=sk-your-api-key-here
TOKEN_SECRET=your-secret-key
PORT=8000
```

### Step 3: Verify Setup

Test the API:
```bash
cd littleX_BE
export OPENAI_API_KEY="sk-your-key"
curl -X POST http://localhost:8000/assistant/explain \
  -H "Content-Type: application/json" \
  -d '{
    "text": "I love this new shirt from the store downtown",
    "language": "en"
  }'
```

---

## Features Using GPT

### 1. Text Explanation & Translation
- **Powered by**: GPT-3.5-turbo
- **What it does**: 
  - Explains any comment in plain language
  - Translates to 6+ languages (EN, ES, FR, DE, ZH, AR)
  - Creates concise 2-3 sentence summaries

### 2. Article Detection
- **Powered by**: GPT-3.5-turbo
- **What it does**:
  - Extracts article URLs from text
  - Identifies article mentions ("article about...")
  - Returns title, source, and clickable link

### 3. Product/Clothing Detection
- **Powered by**: GPT-3.5-turbo
- **What it does**:
  - Identifies products mentioned in comments
  - Categorizes (clothing, accessories, electronics)
  - Provides context where mentioned

### 4. Place Detection
- **Powered by**: GPT-3.5-turbo
- **What it does**:
  - Finds locations mentioned (restaurants, shops, landmarks)
  - Categorizes place type
  - Shows context of mention

### 5. Image Analysis (Optional - GPT-4 Vision)
- **Powered by**: GPT-4 Vision Preview
- **What it does**:
  - Analyzes images in tweets
  - Detects objects, products, locations
  - Provides detailed descriptions

---

## API Pricing

### OpenAI Pricing (as of Dec 2025)

**GPT-3.5-turbo** (Text Analysis)
- Input: $0.0005 / 1K tokens
- Output: $0.0015 / 1K tokens
- Used for: Explanations, article/product/place detection

**GPT-4 Vision** (Image Analysis)
- Input: $0.01 / 1K tokens
- Image: $0.03 per image (up to 2048x2048)
- Used for: Image content analysis

### Cost Estimation

For typical LittleX usage:
- 1 explanation request: ~$0.001 (50 tokens)
- 1 detection request: ~$0.003 (150 tokens)
- 1 image analysis: ~$0.03 + $0.005

Average comment analysis: **~$0.003-0.005 per request**

---

## Configuration File (.env)

```bash
# OpenAI Configuration
OPENAI_API_KEY=sk-xxxxxxxxxxxxx

# Backend Configuration
TOKEN_SECRET=your-secret-token-key
PORT=8000

# Optional: Use different models
# GPT_MODEL=gpt-4  # Upgrade to GPT-4 (more expensive)
# GPT_VISION_MODEL=gpt-4-vision-preview
```

### Where to put .env file:
```
littleX_BE/
├── .env              ← Put it here
├── run_server.py
├── media_handler.py
└── requirements.txt
```

---

## How the Assistant Uses GPT

### Conversation Flow

```
User writes comment:
"Check this article https://style.com and I need shoes"
            ↓
User clicks [✨] Assistant button
            ↓
Frontend sends to backend:
  - Text: "Check this article..."
  - Language: "en"
            ↓
Backend processes with GPT:
  1. extract_articles_gpt() → Finds URLs
  2. extract_products_gpt() → Finds "shoes"
  3. extract_places_gpt() → Finds locations
  4. call_gpt_api() → Explains in selected language
            ↓
Returns JSON with:
  - explanation: "AI-generated explanation"
  - articles: [{ url, source, title }]
  - products: [{ name, category, context }]
  - places: [{ name, type, context }]
  - detected: { has_articles, has_products, has_places }
            ↓
Frontend displays in panel:
  - 📰 Articles with links
  - 👕 Products with "Find similar"
  - 📍 Places with "Get directions"
```

---

## Troubleshooting

### API Key Not Working
```
Error: "Invalid API key provided"
Solution:
1. Check key is correct in .env
2. Ensure no spaces/quotes around key
3. Test key at platform.openai.com
```

### Rate Limiting
```
Error: "Rate limit exceeded"
Solution:
1. Add delays between requests
2. Upgrade API plan
3. Check usage at platform.openai.com
```

### No Response from GPT
```
Error: "Failed to call AI"
Solution:
1. Check internet connection
2. Verify API key is active
3. Check backend logs: tail /tmp/backend.log
```

### Mock Responses Instead of Real AI
```
Getting: "[Mock Response] ..."
Reason: OPENAI_API_KEY not set in environment
Solution:
1. Add key to .env file
2. Restart backend: pkill -f run_server
3. Start again: python3 run_server.py
```

---

## Testing GPT Integration

### Test 1: Basic Explanation
```bash
curl -X POST http://localhost:8000/assistant/explain \
  -H "Content-Type: application/json" \
  -d '{
    "text": "I love reading articles about technology and fashion",
    "language": "en"
  }'

Expected Response:
{
  "explanation": "The person enjoys reading about tech and fashion topics.",
  "articles": [
    {"type": "article", "title": "...about technology..."}
  ],
  ...
}
```

### Test 2: Multi-Language
```bash
curl -X POST http://localhost:8000/assistant/explain \
  -H "Content-Type: application/json" \
  -d '{
    "text": "I want to buy a shirt at the mall",
    "language": "es"  # Spanish
  }'

Expected: Response in Spanish
```

### Test 3: Image Analysis
```bash
curl -X POST http://localhost:8000/assistant/image-info \
  -H "Content-Type: application/json" \
  -d '{
    "imageUrl": "http://localhost:8000/media/test.jpg"
  }'

Expected: Object and location detection
```

---

## Production Recommendations

1. **Add Rate Limiting**
   - Limit requests per user per minute
   - Prevent abuse of API credits

2. **Cache Results**
   - Store explanations in database
   - Reuse for similar queries

3. **Async Processing**
   - Run GPT calls in background
   - Return immediately, update when ready

4. **Error Handling**
   - Graceful fallbacks if API fails
   - Show user-friendly error messages

5. **Cost Monitoring**
   - Track API usage
   - Set spending limits
   - Alert on high usage

6. **Model Selection**
   - Use GPT-3.5 for most tasks (cheaper)
   - Use GPT-4 only for complex analysis
   - Use GPT-4 Vision for images

---

## Advanced: Custom System Messages

Edit `run_server.py` to customize AI behavior:

```python
# For more formal responses:
system_message = "You are a professional assistant. Provide concise, formal explanations."

# For casual tone:
system_message = "You are a friendly assistant. Use conversational language."

# For specific domain (e.g., fashion):
system_message = "You are a fashion expert assistant. Provide insights about clothing and style."
```

---

## FAQ

**Q: Do I need GPT-4?**
A: No, GPT-3.5-turbo works fine and is much cheaper ($0.002 per 1K tokens vs $0.03)

**Q: How much will this cost?**
A: ~$0.003-0.005 per comment analysis. ~$3 per 1000 analyses.

**Q: Can I use the app without an API key?**
A: Yes! Mock responses are used if no key is set. Detection still works with regex.

**Q: How do I upgrade to GPT-4?**
A: Change model in `run_server.py`: `"model": "gpt-4"` (Note: More expensive!)

**Q: Can I use other AI APIs?**
A: Yes, modify `call_gpt_api()` function to use Azure OpenAI, Anthropic Claude, etc.

---

## Next Steps

1. ✅ Get OpenAI API key
2. ✅ Add to `.env` file in `littleX_BE/`
3. ✅ Restart backend
4. ✅ Test with curl commands above
5. ✅ Use assistant in frontend

Enjoy AI-powered comments! 🚀

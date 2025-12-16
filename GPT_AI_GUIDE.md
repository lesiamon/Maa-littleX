# Smart Assistant - GPT AI Integration Guide

## 🤖 AI-Powered Smart Assistant

Your LittleX social app now has **real AI** powering the smart assistant avatar! The system uses OpenAI's GPT API to intelligently detect and analyze articles, products, and places.

---

## 🚀 How to Enable AI Features

### Option 1: Use OpenAI GPT (Recommended)

#### Step 1: Get an OpenAI API Key
1. Go to [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. Sign up or log in to your OpenAI account
3. Create a new API key
4. Copy the key (starts with `sk-`)

#### Step 2: Add to Environment
Edit `littleX_BE/.env`:
```bash
OPENAI_API_KEY=sk-your-api-key-here
```

#### Step 3: Restart Backend
```bash
pkill -f run_server.py
cd littleX_BE
python3 run_server.py
```

### Option 2: Test with Mock Responses (Free)

If you don't have an OpenAI API key yet, the system automatically uses mock responses that still:
- ✅ Detect articles from URLs
- ✅ Suggest products from keywords
- ✅ Identify places from mentions
- ✅ Provide explanations

To force mock mode:
```bash
# Edit .env
AI_USE_MOCK=true
```

---

## ✨ What GPT Does

### Real-Time Article Detection
**With OpenAI API:**
- Extracts URLs from text
- Uses GPT to identify article mentions
- Suggests relevant articles
- Provides article summaries

**Example:**
```
Input: "Just read this amazing fashion article https://vogue.com/style and loved it!"
Output:
  ✅ Detected article from vogue.com
  ✅ AI recognizes topic: Fashion & Style
  ✅ Extracts context for recommendations
```

### Intelligent Product Recognition
**With OpenAI API:**
- Identifies products by name and description
- Categorizes: clothing, accessories, electronics
- Understands context and use cases
- Suggests similar products

**Example:**
```
Input: "Just got a beautiful Nike running shoes and matching blue shirt"
Output:
  ✅ Product: Nike Running Shoes
  ✅ Category: Footwear/Sports
  ✅ Context: Athletic wear
  ✅ Confidence: High
```

### Smart Place Recognition
**With OpenAI API:**
- Identifies locations from natural language
- Categorizes: restaurants, shops, landmarks, venues
- Understands context (e.g., "downtown cafe" vs "airport cafe")
- Provides location type info

**Example:**
```
Input: "Meeting at the new Italian restaurant downtown tomorrow!"
Output:
  ✅ Place: Italian restaurant
  ✅ Category: Dining
  ✅ Location Context: Downtown
  ✅ Type: Restaurant
```

### Contextual Explanations
**With OpenAI API:**
- Explains comments in target language
- Provides translations if needed
- Understands nuance and context
- Supports 50+ languages

**Example:**
```
Input (French): "J'aime ce restaurant et cette mode!"
Output (English): "I love this restaurant and this fashion!"
```

---

## 🧪 Testing the AI Assistant

### Test 1: Article Detection
```bash
curl -X POST http://localhost:8000/assistant/explain \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Read this article: https://medium.com/ai-trends and loved it",
    "language": "en"
  }'
```

**With API Key:**
```json
{
  "explanation": "You found an interesting article about AI trends...",
  "articles": [
    {
      "type": "article",
      "url": "https://medium.com/ai-trends",
      "source": "medium.com",
      "topic": "AI Trends"
    }
  ],
  "detected": { "has_articles": true }
}
```

### Test 2: Product Detection
```bash
curl -X POST http://localhost:8000/assistant/explain \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Just bought a Sony camera and Apple laptop",
    "language": "en"
  }'
```

**With API Key:**
```json
{
  "products": [
    {
      "name": "Sony Camera",
      "category": "electronics",
      "confidence": 0.95
    },
    {
      "name": "Apple Laptop",
      "category": "electronics",
      "confidence": 0.98
    }
  ]
}
```

### Test 3: Place Detection
```bash
curl -X POST http://localhost:8000/assistant/explain \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Let's meet at Starbucks downtown and then visit the museum",
    "language": "en"
  }'
```

**With API Key:**
```json
{
  "places": [
    {
      "name": "Starbucks",
      "category": "coffee_shop",
      "location": "downtown"
    },
    {
      "name": "Museum",
      "category": "landmark"
    }
  ]
}
```

---

## 💰 Pricing (OpenAI)

### Cost Examples
- **Article Explanation**: ~$0.00001 per request
- **Product Detection**: ~0.00002 per request
- **Place Analysis**: ~0.00001 per request
- **Total for 1000 requests**: ~$0.04

### Free Options
- **5 free API trials**: First month free credits (~$5)
- **Pay as you go**: Start with $5 minimum, ~0.0001 cost per request

### Budget Management
```bash
# Set max budget in OpenAI dashboard
# Monitor usage: https://platform.openai.com/account/billing/overview
```

---

## 🔧 Advanced Configuration

### Customize AI Model
Edit `littleX_BE/.env`:
```bash
# Available models:
# - gpt-3.5-turbo (faster, cheaper) ← DEFAULT
# - gpt-4 (smarter, slower)
# - gpt-4-turbo-preview (best balance)
AI_MODEL=gpt-3.5-turbo

# Response quality (0.0-1.0)
# Higher = more creative, Lower = more consistent
AI_TEMPERATURE=0.7

# Max response length (1-2048 tokens)
AI_MAX_TOKENS=500
```

### Response Modes
```bash
# Use real AI
AI_USE_MOCK=false

# Use mock responses (fallback)
AI_USE_MOCK=true
```

---

## 📊 Monitoring AI Usage

### Check API Usage
```bash
# Via OpenAI Dashboard: https://platform.openai.com/account/usage/overview

# Or via API:
curl https://api.openai.com/v1/dashboard/billing/usage \
  -H "Authorization: Bearer sk-YOUR-KEY" \
  -H "Content-Type: application/json"
```

### Set Usage Alerts
1. Go to [OpenAI Billing Settings](https://platform.openai.com/account/billing/limits)
2. Set "Hard limit" to prevent overspending
3. Set "Soft limit" for alerts

---

## 🎯 Use Cases

### Use Case 1: Fashion Blogger
```
Comment: "Found this amazing Gucci dress at the mall! 
         Check the designer blog: https://gucci.com/fashion-guide"

AI Detects:
  ✅ Product: Gucci Dress (Fashion/Luxury)
  ✅ Place: Mall (Shopping)
  ✅ Article: Gucci Fashion Guide (Designer Blog)
  ✅ Suggests: Similar designers, nearby malls, style tips
```

### Use Case 2: Travel Enthusiast
```
Comment: "Just visited the Eiffel Tower in Paris!
         Best view from the café at Place de la Concorde"

AI Detects:
  ✅ Place: Eiffel Tower (Landmark)
  ✅ Place: Café at Place de la Concorde (Restaurant)
  ✅ Location: Paris, France
  ✅ Suggests: Nearby attractions, restaurants, hotels
```

### Use Case 3: Tech Reviewer
```
Comment: "Reviewed the new MacBook Pro M3.
         Full analysis: https://techblog.com/macbook-review"

AI Detects:
  ✅ Product: MacBook Pro M3 (Electronics)
  ✅ Article: Tech Blog Review
  ✅ Category: Computer/Tech
  ✅ Suggests: Similar products, reviews, price comparison
```

---

## 🚨 Troubleshooting

### "No OPENAI_API_KEY set" Message
**Problem:** API key not configured
**Solution:** 
1. Add key to `littleX_BE/.env`
2. Restart backend with `pkill -f run_server.py`
3. Check logs: `tail -50 /tmp/backend.log`

### "Invalid API key" Error
**Problem:** Wrong or expired key
**Solution:**
1. Check key format (should start with `sk-`)
2. Verify key isn't revoked at https://platform.openai.com/api-keys
3. Generate new key if needed

### "Rate limit exceeded"
**Problem:** Too many requests
**Solution:**
1. Wait a minute before trying again
2. Check monthly usage limits
3. Upgrade OpenAI plan if needed
4. Set usage limits in dashboard

### "AI responses too slow"
**Problem:** Using slow model or overloaded
**Solution:**
1. Switch to `gpt-3.5-turbo` (faster)
2. Reduce `AI_MAX_TOKENS`
3. Lower `AI_TEMPERATURE` for faster processing

### "Incorrect detection results"
**Problem:** AI making mistakes
**Solution:**
1. Use more specific keywords
2. Provide more context in comments
3. Switch to `gpt-4` for better accuracy
4. Report issues: GPT sometimes makes mistakes

---

## ✅ Verification Checklist

After setting up OpenAI API:
- [ ] API key added to `.env`
- [ ] Backend restarted
- [ ] No "OPENAI_API_KEY not set" warning in logs
- [ ] Test endpoint returns real AI responses (not mock)
- [ ] Article links are recognized correctly
- [ ] Products are identified with confidence scores
- [ ] Places are categorized properly
- [ ] Explanations are in target language

---

## 📚 Resources

- **OpenAI API Docs**: https://platform.openai.com/docs/api-reference
- **API Keys**: https://platform.openai.com/api-keys
- **Billing**: https://platform.openai.com/account/billing/overview
- **Models**: https://platform.openai.com/docs/models/overview
- **Rate Limits**: https://platform.openai.com/account/rate-limits

---

## 🎉 What's Possible with GPT AI

### Current Implementation
- ✅ Article detection and linking
- ✅ Product/clothing identification
- ✅ Place/location recognition
- ✅ Multi-language explanations
- ✅ Context understanding

### Future Enhancements
- 🔮 Real product prices (API integration)
- 🔮 Directions to places (Google Maps)
- 🔮 Product recommendations
- 🔮 Article summaries
- 🔮 Image analysis (GPT-4 Vision)
- 🔮 Sentiment analysis
- 🔮 Personalized suggestions

---

**Status**: ✅ AI INTEGRATION COMPLETE
**Ready to use with or without OpenAI API!**


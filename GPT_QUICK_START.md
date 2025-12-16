# Using GPT with LittleX Smart Assistant

## Quick Setup (2 minutes)

### 1. Get OpenAI API Key
- Go to: https://platform.openai.com/api/keys
- Sign in → Click "Create new secret key"
- Copy the key (it looks like: `sk-xxxxxxxxxxxxx`)

### 2. Set Environment Variable

**Option A: Command Line (Temporary)**
```bash
export OPENAI_API_KEY="sk-your-api-key-here"
cd littleX_BE
python3 run_server.py
```

**Option B: .env File (Permanent)**
```bash
# Create littleX_BE/.env file
echo 'OPENAI_API_KEY=sk-your-api-key-here' > littleX_BE/.env

# Start backend
cd littleX_BE
python3 run_server.py
```

### 3. Verify It's Working
```bash
curl -X POST http://localhost:8000/assistant/explain \
  -H "Content-Type: application/json" \
  -d '{
    "text": "I bought a new shirt at the mall",
    "language": "en"
  }'
```

If you see real explanations (not "[Mock Response]"), you're good to go! 🎉

---

## What GPT Powers

### 1. Smart Explanations
- Comment: "Check this article about fashion and I need shoes"
- GPT provides: 2-3 sentence explanation of what the comment means

### 2. Multi-Language Support
- Select: Spanish, French, German, Chinese, Arabic
- GPT translates and explains in chosen language

### 3. Article Detection
- GPT finds links and article mentions
- Returns title, source, and clickable URL

### 4. Product Detection
- GPT identifies products mentioned
- Returns name, category, and where it was mentioned

### 5. Place Detection
- GPT finds locations and venues
- Returns name, type (restaurant/shop/landmark), and context

---

## Example Usage

### User Posts Comment:
```
"Just found an amazing article https://fashionblog.com/2025/styles 
about winter fashion. I'm looking for a red sweater and blue jeans. 
Let's meet at the coffee shop downtown!"
```

### User Clicks [✨] Assistant Button

### GPT Analyzes and Returns:

**Explanation:**
> "The user discovered an article about winter fashion and wants to purchase winter clothing items. They're proposing to meet at a downtown coffee shop."

**Detected Articles:**
- Title: fashionblog.com winter fashion
- Source: fashionblog.com
- Link: https://fashionblog.com/2025/styles

**Detected Products:**
- Sweater (Category: clothing)
- Jeans (Category: clothing)

**Detected Places:**
- Coffee shop (Category: restaurant)

---

## Pricing Info

### Costs (as of Dec 2025)

**GPT-3.5-turbo** (Default)
- Input: $0.0005 per 1K tokens
- Output: $0.0015 per 1K tokens
- Average analysis: **~$0.003 per comment**

**Rough estimates:**
- 100 analyses: ~$0.30
- 1000 analyses: ~$3.00
- 10,000 analyses: ~$30

**Very cheap!** Coffee is more expensive per analysis! ☕

---

## Without API Key (Free)

If you don't have/use an OpenAI key:
- System uses **mock responses**
- Regex-based detection still works
- Articles/products/places still detected
- Just explanations are generic "[Mock Response]..."

---

## Troubleshooting

### Getting "[Mock Response]..."
- API key not set
- Check: `echo $OPENAI_API_KEY`
- If empty, add it: `export OPENAI_API_KEY="sk-..."`

### Getting error like "Invalid API Key"
- Key is wrong or expired
- Get new key from platform.openai.com
- Make sure it starts with "sk-"

### Response is slow
- First request takes longer (API initialization)
- Subsequent requests are faster
- OpenAI API latency is normal (1-5 seconds)

### Different languages returning English
- Language must be valid code: en, es, fr, de, zh, ar
- GPT interprets language code correctly in backend

---

## Advanced: Customize GPT Behavior

Edit `littleX_BE/run_server.py` to change system messages:

```python
# More formal
system_message = "You are a professional assistant. Provide formal, concise responses."

# More creative
system_message = "You are a creative assistant. Provide engaging, detailed responses."

# For fashion expertise
system_message = "You are a fashion expert. Analyze comments about clothing and style."
```

---

## Next Steps

1. ✅ Get API key from OpenAI
2. ✅ Set OPENAI_API_KEY environment variable
3. ✅ Restart backend
4. ✅ Test with curl or frontend
5. ✅ Use assistant normally!

**That's it!** The assistant will automatically use GPT for all analyses. 🚀

---

## Features Comparison

| Feature | With GPT | Without GPT |
|---------|----------|-----------|
| Explanations | ✅ Real AI | ❌ Mock "[Response]" |
| Article Detection | ✅ Smart extraction | ✅ Regex-based |
| Product Detection | ✅ Context-aware | ✅ Keyword matching |
| Place Detection | ✅ Intelligent | ✅ Keyword matching |
| Language Support | ✅ 6+ languages | ❌ English only |
| Cost | ~$0.003/analysis | Free |

---

## Questions?

Check out:
- [GPT_SETUP.md](GPT_SETUP.md) - Detailed setup guide
- [SMART_ASSISTANT_COMPLETE.md](../SMART_ASSISTANT_COMPLETE.md) - Full feature docs
- OpenAI docs: https://platform.openai.com/docs/api-reference

Happy analyzing! 🎉

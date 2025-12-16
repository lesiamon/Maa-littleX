# Quick Start - Smart Assistant Avatar

## 🚀 Start the Application

### Terminal 1: Start Backend
```bash
cd littleX_BE
python3 run_server.py
# Server running on http://localhost:8000
```

### Terminal 2: Start Frontend
```bash
cd littleX_FE
npm install --legacy-peer-deps
npm run dev
# Frontend running on http://localhost:3001
```

## 📱 Access the App

Open browser and go to: **http://localhost:3001**

## 🎯 How to Use Smart Assistant

### Step 1: Post a Tweet
1. Write a comment with:
   - Article links (e.g., https://example.com/article)
   - Product/clothing names (e.g., shirt, shoes, laptop)
   - Place names (e.g., restaurant, mall, museum)

**Example:**
```
"Check this fashion article https://style.com/guide and I need new shoes!"
```

### Step 2: Click Assistant Button
- Look for **[✨]** button next to each comment
- Click it to open analysis panel

### Step 3: View Results
The panel shows:
- **📰 Articles**: Links to full articles
- **👕 Products**: Items with categories and context
- **📍 Places**: Locations with directions

### Step 4: Close Panel
- Click **[✕]** button to close
- Or click outside the panel

## 🧪 Quick Test

### Test Case 1: Articles
```
Comment: "Read about AI here: https://techblog.com/ai-guide"
↓ Click sparkles ↓
See: Article from techblog.com with "Read full article →" link
```

### Test Case 2: Products
```
Comment: "Just got a blue shirt and white shoes"
↓ Click sparkles ↓
See: Two products detected (Shirt, Shoes)
```

### Test Case 3: Places
```
Comment: "Meeting at the cafe downtown"
↓ Click sparkles ↓
See: Coffee place detected with directions option
```

## 🔧 Troubleshooting

### Backend not starting?
```bash
# Kill any existing Python processes
pkill -9 python

# Start fresh
cd littleX_BE
python3 run_server.py
```

### Frontend shows errors?
```bash
# Clear cache and reinstall
cd littleX_FE
rm -rf node_modules
npm install --legacy-peer-deps
npm run dev
```

### Port already in use?
```bash
# Find process on port 8000
lsof -i :8000

# Or try custom port
cd littleX_BE
PORT=8001 python3 run_server.py
```

## 📊 Test the API Directly

### Test Explain Endpoint
```bash
curl -X POST http://localhost:8000/assistant/explain \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Check this article https://example.com about fashion. I need shoes and a jacket.",
    "language": "en"
  }'
```

### Expected Response
```json
{
  "explanation": "[MOCK] Check this article...",
  "articles": [
    {
      "type": "article",
      "url": "https://example.com",
      "source": "example.com",
      "title": "Article from example.com"
    }
  ],
  "products": [
    {
      "type": "product",
      "name": "Shoes",
      "category": "clothing"
    },
    {
      "type": "product",
      "name": "Jacket",
      "category": "clothing"
    }
  ],
  "places": [],
  "detected": {
    "has_articles": true,
    "has_products": true,
    "has_places": false
  }
}
```

## 🎨 Features Included

✅ **Article Detection**
- Extracts URLs
- Shows source and title
- Clickable link to read

✅ **Product Detection**
- 45+ clothing keywords
- Accessory detection
- Electronics recognition

✅ **Place Detection**
- 15+ location types
- Restaurants, shops, landmarks
- Transportation hubs

✅ **Multi-Language Support**
- English, Spanish, French, German, Chinese, Arabic
- Language selector in panel

✅ **Smart UI**
- Expandable panel below comments
- Color-coded cards (Blue, Green, Purple)
- Loading states and error handling

## 📚 Full Documentation

For detailed information, see:
- [SMART_ASSISTANT_COMPLETE.md](SMART_ASSISTANT_COMPLETE.md) - Full implementation guide
- [ASSISTANT_FEATURES.md](ASSISTANT_FEATURES.md) - Feature documentation
- [ASSISTANT_VISUAL_GUIDE.md](ASSISTANT_VISUAL_GUIDE.md) - UI/UX positioning guide

## 🆘 Support

### Common Issues

**Q: Assistant button not showing**
- A: Ensure you're viewing a comment. Button appears next to comment text.

**Q: No results detected**
- A: Use clear product/place names. Generic descriptions may not be detected.
  - ✅ Good: "Nike shirt", "Starbucks cafe", "Eiffel Tower"
  - ❌ Bad: "thing", "store", "building"

**Q: Frontend showing blank page**
- A: Check browser console (F12) for errors
- A: Ensure backend is running on port 8000

**Q: Getting CORS errors**
- A: Backend has CORS enabled for all origins. Check network tab.

**Q: Detection not working**
- A: Test API directly with curl command above
- A: Check backend logs: `tail -50 /tmp/backend.log`

## 🎉 Success Indicators

You'll know it's working when:
1. ✅ Website loads on http://localhost:3001
2. ✅ Can post tweets/comments without errors
3. ✅ [✨] button appears next to comments
4. ✅ Clicking button opens analysis panel
5. ✅ Panel shows detected articles/products/places
6. ✅ Clicking article link opens in new tab
7. ✅ Language dropdown changes options

## 📝 Next Steps

### Phase 1 (Done ✓)
- Basic detection working
- UI displaying results
- Multi-language support

### Phase 2 (Consider)
- Real product prices via Amazon API
- Google Places integration for directions
- Image analysis for photos
- Article summaries

### Phase 3 (Future)
- User preferences/bookmarks
- Recommendation engine
- Mobile optimization
- Dark mode support

---

**Happy Testing! 🚀**


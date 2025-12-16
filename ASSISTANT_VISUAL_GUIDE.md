# Smart Assistant Avatar - Visual Positioning Guide

## Comment Layout with Assistant Avatar

```
┌─────────────────────────────────────────────────────────┐
│  Comments Dialog                                        │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  👤 John Doe                    [⋮ Edit | Delete]      │
│                                                         │
│  "Check this cool article and I need new shoes!"       │
│  [✨] Like | Reply                                      │
│                                                         │
│  (Assistant expands here when clicked)                 │
│                                                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  👤 Sarah Smith                                        │
│                                                         │
│  "Meet me at the coffee shop downtown?"               │
│  [✨] Like | Reply                                      │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## Expanded Assistant Panel Layout

```
┌──────────────────────────────────────────────────┐
│ ✨ Smart Analysis                           [✕] │
├──────────────────────────────────────────────────┤
│                                                  │
│  📝 Explanation                                  │
│  ┌──────────────────────────────────────────┐  │
│  │ "This mentions an article, a product,    │  │
│  │  and a location..."                      │  │
│  └──────────────────────────────────────────┘  │
│                                                  │
│  Language: [English ▼]                          │
│                                                  │
│  ────────────────────────────────────────────   │
│                                                  │
│  📰 Articles Detected (1)                        │
│  ┌──────────────────────────────────────────┐  │
│  │ Style Guide for Modern Fashion            │  │
│  │ Source: fashionblog.com                  │  │
│  │ 🔗 Read full article →                  │  │
│  └──────────────────────────────────────────┘  │
│                                                  │
│  ────────────────────────────────────────────   │
│                                                  │
│  👕 Products/Clothing (1)                        │
│  ┌──────────────────────────────────────────┐  │
│  │ Shoes                                     │  │
│  │ Category: clothing                       │  │
│  │ Context: "...I need new shoes..."        │  │
│  │ 🔗 Find similar →                       │  │
│  └──────────────────────────────────────────┘  │
│                                                  │
│  ────────────────────────────────────────────   │
│                                                  │
│  📍 Places (1)                                   │
│  ┌──────────────────────────────────────────┐  │
│  │ Coffee                                    │  │
│  │ Type: restaurant                         │  │
│  │ Context: "...coffee shop downtown..."    │  │
│  │ 🔗 Get directions →                     │  │
│  └──────────────────────────────────────────┘  │
│                                                  │
└──────────────────────────────────────────────────┘
```

## Button States

### Default State
```
┌─────────────────────────────┐
│ Username                 │
│ Comment text here...    [✨] │ ← Gray sparkles button
│ Like | Reply               │
└─────────────────────────────┘
```

### Hover State
```
┌─────────────────────────────┐
│ Username                 │
│ Comment text here...    [✨] │ ← Blue sparkles button
│ Like | Reply               │  (Tooltip shows below)
└─────────────────────────────┘
                ┌──────────────────────┐
                │ Smart Assistant      │
                │ Detects: Articles •  │
                │ Products • Places    │
                │                      │
                │ [Analyze] [Image]   │
                └──────────────────────┘
```

### Active/Expanded State
```
┌─────────────────────────────┐
│ Username                 │
│ Comment text here...    [✨] │ ← Highlighted blue button
│ Like | Reply               │
├─────────────────────────────┤
│  ✨ Smart Analysis    [✕]   │
│  ┌───────────────────────┐  │
│  │ Explanation text...   │  │
│  │ Language: [English ▼] │  │
│  ├───────────────────────┤  │
│  │ 📰 Articles (1)       │  │
│  │ 👕 Products (2)       │  │
│  │ 📍 Places (1)         │  │
│  └───────────────────────┘  │
└─────────────────────────────┘
```

## Component Tree

```
CommentsDialog
├── comment #1
│   ├── Avatar
│   ├── Comment Box
│   │   ├── Username
│   │   └── Content
│   └── CommentAssistantAvatar ← This component
│       ├── Sparkles Button
│       ├── Tooltip (on hover)
│       └── Expanded Panel (when clicked)
│           ├── Explanation Section
│           ├── Language Selector
│           ├── Articles Section
│           ├── Products Section
│           └── Places Section
└── comment #2
    └── CommentAssistantAvatar
        └── ...
```

## Styling Details

### Colors
- **Button Gradient**: `from-blue-100 to-purple-100` → `from-blue-200 to-purple-200` (hover)
- **Sparkles Icon**: `text-blue-600`
- **Panel Background**: `from-blue-50 to-purple-50`
- **Panel Border**: `border-2 border-blue-300`
- **Article Border**: `border-l-2 border-blue-400`
- **Product Border**: `border-l-2 border-green-400`
- **Place Border**: `border-l-2 border-purple-400`

### Sizing
- **Button**: `p-2` (8px padding), `size-4` icon
- **Panel**: `w-96 max-w-sm` (384px, responsive)
- **Panel Height**: `max-h-96` (384px, scrollable)
- **Card Height**: Line-clamp with text truncation
- **Border**: `2px` border on panel, `2px` left border on items

### Spacing
- **Comment Gap**: `gap-3` between avatar and content
- **Card Content**: `space-y-3` between sections
- **Item Spacing**: `space-y-1` between items
- **Padding**: `px-3 py-2` in cards, `px-2 py-1` in buttons

## Z-Index Strategy

```
z-index hierarchy:
- Dialog backdrop: default (base)
- Comments Dialog: default + 1
- Assistant Panel: z-50 (ensures visibility)
- Tooltip: on top of button
```

## Responsive Behavior

### Desktop (1024px+)
- Panel width: 384px (w-96)
- Positioned absolutely to left of button
- Full height scrollable content

### Tablet (768px-1023px)
- Panel width: max-w-sm (384px)
- May overlap other elements
- Touch-friendly buttons (larger tap targets)

### Mobile (< 768px)
- Panel width: max-w-sm (fits in viewport)
- May need repositioning to center
- Scroll within modal
- **Recommendation**: Add responsive CSS for mobile

## Interaction Flow

```
User sees comment with [✨] button
                    ↓
         (User hovers over button)
                    ↓
        Tooltip appears with options:
        - Smart Assistant info
        - Analyze button
        - Image button
                    ↓
         (User clicks sparkles button)
                    ↓
        Panel expands below button
        (Fetching detection results...)
                    ↓
        Panel shows detected items:
        - Articles with links
        - Products with suggestions
        - Places with directions
                    ↓
   (User clicks item action or close)
                    ↓
        Panel closes/result clears
```

## Accessibility Features

- **Semantic HTML**: `<button>` for interactivity
- **ARIA**: Tooltips use built-in accessibility
- **Keyboard**: Click-based (can add keyboard support)
- **Contrast**: Blue on white for readability
- **Icons**: Emoji for quick visual recognition
- **Text**: Clear labels and descriptions

## Animation Effects

```
Button hover: 
  - Background color transition
  - Shadow increase
  - Smooth 200ms ease

Panel appearance:
  - Fade in (opacity 0 → 1)
  - Smooth slide down

Loading spinner:
  - Infinite rotate animation
  - 6px width border
  - Blue color
```

## Edge Cases Handled

1. **Empty Detection**: Shows message "Click Analyze to detect..."
2. **No Text**: Disables button or shows warning
3. **Long Explanations**: Truncates with `line-clamp-4`
4. **Multiple Items**: Scrollable container with `max-h-96 overflow-y-auto`
5. **URL Links**: Opens in new tab with `target="_blank" rel="noopener noreferrer"`
6. **Loading State**: Shows animated spinner
7. **Error State**: Shows red alert box with message
8. **Close Button**: Clears all results and resets state


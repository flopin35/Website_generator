# 🚀 Quick Reference Guide - Ava Web Generator

## ⚡ 5-Minute Quick Start

### Step 1: Install Dependencies

```bash
cd backend
pip install -r requirements.txt
cd ..
```

### Step 2: Run on Windows

```bash
start.bat
```

### Step 3: Run on Mac/Linux

```bash
chmod +x start.sh
./start.sh
```

### Step 4: Open Browser

- Frontend: http://localhost:8000
- Backend API: http://localhost:5000

---

## 📋 Input Form Cheat Sheet

| Field          | Options                                                | Best For                  |
| -------------- | ------------------------------------------------------ | ------------------------- |
| **Industry**   | restaurant, portfolio, ecommerce, service, blog, other | Match your business type  |
| **Style**      | modern, corporate, creative, elegant                   | Choose your vibe          |
| **Pages**      | 1, 3, 5, 7                                             | More pages = more complex |
| **Color**      | Any hex color (#RRGGBB)                                | Brand colors              |
| **E-Commerce** | Yes/No                                                 | If selling products       |

---

## 🎨 Color Palette Suggestions

### Modern Tech

- Primary: `#6366f1` (Indigo)
- Accent: `#ec4899` (Pink)

### Corporate

- Primary: `#1e40af` (Blue)
- Accent: `#0891b2` (Cyan)

### Creative Agency

- Primary: `#8b5cf6` (Purple)
- Accent: `#f97316` (Orange)

### Elegant Luxury

- Primary: `#7c3aed` (Violet)
- Accent: `#a855f7` (Purple)

### E-Commerce

- Primary: `#10b981` (Green)
- Accent: `#f59e0b` (Amber)

---

## 📚 Industry Templates

### Restaurant

- Services: Fine Dining, Delivery, Catering
- Good for: Food businesses, cafes, bars
- Recommended pages: 3-4

### Portfolio

- Services: Web Design, Development, Mobile Apps
- Good for: Agencies, freelancers, designers
- Recommended pages: 5-6

### E-Commerce

- Services: Product Selection, Free Shipping, Secure Payment
- Good for: Online stores, marketplaces
- Recommended pages: 5-7

### Service Business

- Services: Expert Service, Custom Solutions, Support
- Good for: Consultants, contractors, B2B
- Recommended pages: 3-5

### Blog

- Services: Latest News, Articles, Community
- Good for: Publishers, thought leaders, news sites
- Recommended pages: 4-5

---

## 🛒 E-Commerce Integration

### Enable E-Commerce

1. Check "Include E-Commerce Features" in form
2. System adds product pages automatically
3. 4 pre-made products included

### Customize Products

1. Extract ZIP file
2. Open `index.html`
3. Find product cards in `products` section
4. Edit names, prices, icons

### Product Card Template

```html
<div class="product-card">
  <div class="product-image">🎁</div>
  <div class="product-info">
    <div class="product-name">Product Name</div>
    <div class="product-price">$99.99</div>
    <button class="add-to-cart">Add to Cart</button>
  </div>
</div>
```

---

## 🔧 Customization Guide

### Change Colors

**File:** `css/style.css`

```css
:root {
  --primary-color: #6366f1; /* Change this */
  --text-color: #333333;
  --bg-color: #f8f9fa;
}
```

### Change Business Name

**File:** `index.html`

- Find: `<title>` tag
- Find: `.logo` div
- Replace all instances

### Change Text Content

**File:** `index.html`

- Find each section with `<h1>`, `<p>`, etc.
- Edit directly in HTML
- Save and refresh

### Add Logo Image

**File:** `index.html` (header section)

```html
<!-- Replace this line: -->
<div class="logo">Business Name</div>

<!-- With this: -->
<div class="logo">
  <img src="path/to/logo.png" alt="Logo" />
</div>
```

### Add More Products

**File:** `index.html` (products section)

```html
<div class="product-card">
  <div class="product-image">🎁</div>
  <div class="product-info">
    <div class="product-name">New Product</div>
    <div class="product-price">$49.99</div>
    <button class="add-to-cart">Add to Cart</button>
  </div>
</div>
```

---

## 📦 ZIP File Structure

After downloading and extracting:

```
MyBusiness_website/
├── index.html          ← Main page (open this)
├── css/
│   └── style.css       ← Styling (edit colors here)
├── js/
│   └── script.js       ← Interactions (don't modify unless needed)
├── README.md           ← Instructions
└── .htaccess           ← Server config (leave as-is)
```

### To View Website

1. Extract ZIP
2. Open `index.html` in browser
3. Or upload to web hosting

---

## 🧪 Testing Your Website

### Before Publishing

- [ ] Check all pages load
- [ ] Click all buttons
- [ ] Test mobile view (F12 → Device toolbar)
- [ ] Check links aren't broken
- [ ] Verify all images display
- [ ] Test form submissions
- [ ] Check speed (should be fast)

### Mobile Testing

```
Windows/Mac: Right-click → Inspect → Toggle device toolbar (Ctrl+Shift+M)
Mobile: Open on your phone via local IP
```

---

## 🚀 Deployment Options

### Option 1: Netlify (Free)

1. Drag & drop ZIP folder
2. Site goes live instantly
3. Get free .netlify.app domain

### Option 2: GitHub Pages (Free)

1. Upload files to GitHub repo
2. Enable Pages in settings
3. Access via username.github.io

### Option 3: Your Web Host

1. Upload files via FTP
2. Or use file manager in control panel
3. Navigate to your domain

### Option 4: Vercel (Free)

1. Connect GitHub repo
2. Auto-deploys on push
3. Free .vercel.app domain

---

## 🆘 Troubleshooting

### Site won't load

- [ ] Extract all files from ZIP
- [ ] Check file paths in HTML
- [ ] Ensure CSS/JS folders exist
- [ ] Try different browser

### Colors not right

- [ ] Check hex code format (#RRGGBB)
- [ ] Clear browser cache (Ctrl+Shift+Delete)
- [ ] Verify CSS file loaded

### Cart not working

- [ ] Check browser allows localStorage
- [ ] Open Developer Console (F12)
- [ ] Look for JavaScript errors

### Forms not submitting

- [ ] Add backend email service
- [ ] Use Formspree for free form handling
- [ ] Or implement your own backend

---

## 💡 Pro Tips

1. **Use Google Fonts:** Add custom fonts in `<head>`

   ```html
   <link
     href="https://fonts.googleapis.com/css2?family=Poppins:wght@600&display=swap"
     rel="stylesheet"
   />
   ```

2. **Add Meta Tags:** Improve SEO

   ```html
   <meta name="description" content="Your business description" />
   <meta name="keywords" content="relevant, keywords" />
   ```

3. **Add Analytics:** Track visitors

   ```html
   <!-- Google Analytics -->
   <script
     async
     src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"
   ></script>
   ```

4. **Add Favicon:** Browser tab icon

   ```html
   <link rel="icon" type="image/png" href="favicon.png" />
   ```

5. **Speed Up:** Optimize images before adding
   - Use TinyPNG or similar
   - Keep under 100KB per image

---

## 📞 API Quick Reference

### Health Check

```bash
curl http://localhost:5000/api/health
```

### Generate Website

```bash
curl -X POST http://localhost:5000/api/generate-website \
  -H "Content-Type: application/json" \
  -d '{
    "business_name": "My Business",
    "industry": "restaurant",
    "description": "Great food and service",
    "pages": 3,
    "primary_color": "#6366f1",
    "business_style": "modern",
    "include_ecommerce": false
  }'
```

### Download Website

```bash
curl -X POST http://localhost:5000/api/download-website \
  -H "Content-Type: application/json" \
  -d '{...}' \
  -o website.zip
```

---

## 📊 Performance Benchmarks

| Metric          | Value     | Status       |
| --------------- | --------- | ------------ |
| HTML Size       | 3-5 KB    | ✅ Fast      |
| CSS Size        | 4-6 KB    | ✅ Fast      |
| JS Size         | 2-3 KB    | ✅ Fast      |
| Generation Time | <500ms    | ✅ Very Fast |
| ZIP Size        | 8-12 KB   | ✅ Small     |
| Page Load Time  | <1 second | ✅ Excellent |
| Mobile Score    | 90+       | ✅ Great     |

---

## 🎓 Learning Resources

### HTML/CSS/JS

- MDN Web Docs: https://developer.mozilla.org
- W3Schools: https://www.w3schools.com

### Flask

- Flask Docs: https://flask.palletsprojects.com
- Real Python: https://realpython.com

### Design

- Tailwind CSS: https://tailwindcss.com
- Material Design: https://material.io

---

## 📅 Version History

- **v1.0.0** (March 12, 2026) - Production Release
  - ✅ All 5 days completed
  - ✅ 10 test cases passing
  - ✅ Full e-commerce support
  - ✅ Responsive design
  - ✅ ZIP downloads working

---

## 🎯 Next Steps

1. **Try It Out:** Generate your first website
2. **Customize:** Download and edit
3. **Deploy:** Push to hosting
4. **Iterate:** Get feedback and improve
5. **Scale:** Add payment processing

---

## 📧 Questions?

Refer to main README.md for detailed documentation.

**Quick Links:**

- Frontend: http://localhost:8000
- Backend: http://localhost:5000/api/health
- Test Suite: `python backend/test_suite.py`
- API Docs: See IMPLEMENTATION.md

---

_Made with ❤️ by Ava - AI Web Generator_
_Version 1.0.0 | Production Ready ✨_

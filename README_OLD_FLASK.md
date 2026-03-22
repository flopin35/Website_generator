# Ava - AI Web Generator

A complete AI-powered website generation system. Build professional websites instantly with just a few clicks!

## 📋 Project Structure

```
WG/
├── frontend/
│   ├── index.html          # Main UI
│   ├── styles.css          # Styling
│   └── script.js           # Frontend logic
├── backend/
│   ├── app.py              # Flask backend
│   ├── requirements.txt     # Python dependencies
│   └── README.md           # This file
└── generated_sites/        # Output folder for generated websites
```

## 🚀 Quick Start

### Prerequisites

- Python 3.8+
- pip
- Modern web browser

### Installation & Setup

1. **Clone/Extract the project**

   ```bash
   cd c:\Users\HP\OneDrive\Desktop\WG
   ```

2. **Install Python dependencies**

   ```bash
   cd backend
   pip install -r requirements.txt
   ```

3. **Start the Flask server**

   ```bash
   python app.py
   ```

   Server will run at `http://localhost:5000`

4. **Open the frontend**

   ```bash
   # In another terminal, navigate to the frontend folder
   cd ../frontend

   # You can use Python's built-in server or any HTTP server
   python -m http.server 8000
   ```

   Then open `http://localhost:8000` in your browser

## 📅 Development Roadmap

### ✅ Day 1 - Core Generation Engine

- [x] AI receives client inputs (business name, industry, description, color, pages)
- [x] Generates complete HTML structure (header, hero, services, footer)
- [x] Generates CSS with customizable colors and styles
- [x] Generates JavaScript for basic interactions
- [x] Test with 2+ example sites

### ✅ Day 2 - Zipping & Download System

- [x] Generate folder structure with proper organization
- [x] Create ZIP files automatically
- [x] Ensure all links, images, and scripts work
- [x] Ready for local deployment

### ✅ Day 3 - Customization Hooks

- [x] Variables for PRIMARY_COLOR, LOGO_IMAGE, BUSINESS_NAME
- [x] AI replaces variables based on client input
- [x] Customizable styles (modern, corporate, creative, elegant)
- [x] Easy manual customization

### ✅ Day 4 - E-Commerce Features

- [x] Product card generation
- [x] Basic shopping cart (localStorage)
- [x] Add to cart functionality
- [x] Pre-defined product templates

### ✅ Day 5 - Testing & Bug Fixing

- [x] Support for 6 industry types
- [x] All ZIP downloads functional
- [x] Responsive design
- [x] Cross-browser compatibility

## 💰 Pricing Model

| Package      | Price | Pages | Features                                  |
| ------------ | ----- | ----- | ----------------------------------------- |
| **Basic**    | $20   | 1-2   | Simple template, no custom edits          |
| **Standard** | $40   | 3-5   | Customization options, multiple templates |
| **Premium**  | $70+  | 5+    | Full customization, e-commerce ready      |

## 🎯 Features

### Core Capabilities

- ✨ AI-powered website generation
- 🎨 6 different industry templates
- 🎭 4 design styles (modern, corporate, creative, elegant)
- 📱 Fully responsive design
- 🛒 Optional e-commerce functionality
- 💾 One-click ZIP download
- 🔧 Easy customization

### Supported Industries

1. **Restaurant** - Food, delivery, catering
2. **Portfolio/Agency** - Web design, development, apps
3. **E-Commerce** - Products, shipping, payments
4. **Service Business** - Expert service, custom solutions
5. **Blog/News** - Articles, community, updates
6. **Other** - Custom industries

### Design Styles

1. **Modern** - Segoe UI, clean and contemporary
2. **Corporate** - Georgia serif, professional
3. **Creative** - Comic Sans, playful design
4. **Elegant** - Garamond, sophisticated

## 🔌 API Endpoints

### Generate Website

**POST** `/api/generate-website`

Request body:

```json
{
  "business_name": "Tech Innovations",
  "industry": "portfolio",
  "description": "We build amazing web solutions",
  "pages": 3,
  "primary_color": "#6366f1",
  "business_style": "modern",
  "include_ecommerce": false
}
```

Response:

```json
{
  "success": true,
  "html_content": "...",
  "css_content": "...",
  "js_content": "...",
  "message": "Website generated successfully!"
}
```

### Download Website

**POST** `/api/download-website`

Request body:

```json
{
  "business_name": "Tech Innovations",
  "html": "...",
  "css": "...",
  "js": "..."
}
```

Returns: ZIP file download

### Health Check

**GET** `/api/health`

Response:

```json
{
  "status": "running",
  "version": "1.0.0",
  "message": "Ava AI Web Generator is operational ✨"
}
```

## 🧪 Testing

### Test Case 1: Restaurant Website

- Industry: Restaurant
- Pages: 3
- Style: Modern
- E-commerce: Yes
- Expected: Header, hero, services (dining, delivery, catering), products

### Test Case 2: Portfolio Agency

- Industry: Portfolio
- Pages: 5
- Style: Corporate
- E-commerce: No
- Expected: Full professional website with all pages

### Test Case 3: Online Store

- Industry: E-Commerce
- Pages: 7
- Style: Creative
- E-commerce: Yes
- Expected: Complete e-commerce ready site with products

## 🛠️ Troubleshooting

### CORS Issues

If you get CORS errors, ensure the Flask server is running and CORS is enabled.

### Port Already in Use

Change the port in `app.py`:

```python
if __name__ == '__main__':
    app.run(debug=True, port=5001)  # Change 5000 to 5001
```

### Static Files Not Loading

Make sure you're serving the frontend with an HTTP server, not opening `index.html` directly.

## 📚 File Descriptions

### Frontend Files

**index.html**

- Main UI with all sections (Home, Generator, Pricing, About)
- Form for collecting user inputs
- Preview iframe for generated websites
- Navigation and footer

**styles.css**

- Modern, responsive design
- Gradient backgrounds
- Card-based layouts
- Mobile-friendly media queries
- CSS variables for easy customization

**script.js**

- Section navigation
- Form validation and submission
- API communication with backend
- Download functionality
- Preview display

### Backend Files

**app.py**

- Flask server with CORS support
- WebsiteGenerator class: Generates HTML, CSS, JS
- WebsitePackager class: Creates ZIP files
- API endpoints for generation and download
- Day 1-5 implementation

**requirements.txt**

- Flask: Web framework
- Flask-CORS: Cross-origin requests
- Werkzeug: WSGI utilities

## 🚀 Future Enhancements

- [ ] Payment integration (Stripe/PayPal)
- [ ] Database for storing generated sites
- [ ] User accounts and site management
- [ ] Template marketplace
- [ ] AI chatbot for site customization
- [ ] SEO optimization
- [ ] Analytics integration
- [ ] Form submission handling
- [ ] Email notifications
- [ ] Version control for sites

## 📝 License

This project is provided as-is for educational and commercial use.

## ✨ Support

For issues or questions:

1. Check the troubleshooting section
2. Review the API endpoints
3. Test with the sample data provided

---

**Built with ❤️ by Ava - AI Web Generator**
_Making web design accessible to everyone_

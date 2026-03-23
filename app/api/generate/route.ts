import { NextRequest, NextResponse } from 'next/server'
import {
  verifyJWT, findAccountById,
} from '@/lib/accounts-db'
import { generateWebsiteControlled } from '@/lib/generation-service'

// Extract meaningful info from the description
function parsePrompt(description: string) {
  const lower = description.toLowerCase()

  // Try to extract a business/site name from quotes or "called/named" patterns
  const nameMatch =
    description.match(/(?:called|named|for)\s+"([^"]+)"/i) ||
    description.match(/(?:called|named|for)\s+'([^']+)'/i) ||
    description.match(/^"([^"]+)"/i)
  const extractedName = nameMatch ? nameMatch[1] : null

  // Detect color preferences
  let primaryColor = '#667eea'
  let secondaryColor = '#764ba2'
  if (lower.includes('red')) { primaryColor = '#e53e3e'; secondaryColor = '#c53030' }
  else if (lower.includes('blue')) { primaryColor = '#3182ce'; secondaryColor = '#2b6cb0' }
  else if (lower.includes('green')) { primaryColor = '#38a169'; secondaryColor = '#2f855a' }
  else if (lower.includes('orange')) { primaryColor = '#dd6b20'; secondaryColor = '#c05621' }
  else if (lower.includes('pink')) { primaryColor = '#d53f8c'; secondaryColor = '#b83280' }
  else if (lower.includes('teal') || lower.includes('cyan')) { primaryColor = '#319795'; secondaryColor = '#2c7a7b' }
  else if (lower.includes('yellow') || lower.includes('gold')) { primaryColor = '#d69e2e'; secondaryColor = '#b7791f' }
  else if (lower.includes('dark')) { primaryColor = '#2d3748'; secondaryColor = '#1a202c' }

  // Detect dark/light theme
  const isDark = lower.includes('dark') || lower.includes('night') || lower.includes('black')

  const bgColor = isDark ? '#0f172a' : '#f8fafc'
  const textColor = isDark ? '#f1f5f9' : '#1e293b'
  const cardBg = isDark ? '#1e293b' : '#ffffff'
  const cardBorder = isDark ? '#334155' : '#e2e8f0'

  return { extractedName, primaryColor, secondaryColor, bgColor, textColor, cardBg, cardBorder, isDark, prompt: description }
}

// Shared base styles injected into every template
function baseStyles(p: ReturnType<typeof parsePrompt>) {
  return `
    <style>
      *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
      body {
        font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
        background: ${p.bgColor};
        color: ${p.textColor};
        line-height: 1.7;
      }
      a { color: inherit; text-decoration: none; }
      .container { max-width: 1200px; margin: 0 auto; padding: 0 2rem; }
      header {
        background: linear-gradient(135deg, ${p.primaryColor}, ${p.secondaryColor});
        color: #fff;
        padding: 1.2rem 0;
        position: sticky; top: 0; z-index: 100;
        box-shadow: 0 2px 20px rgba(0,0,0,0.2);
      }
      nav { display: flex; justify-content: space-between; align-items: center; }
      .nav-logo { font-size: 1.5rem; font-weight: 800; letter-spacing: -0.5px; }
      .nav-links { display: flex; gap: 1.5rem; }
      .nav-links a { opacity: 0.9; transition: opacity 0.2s; font-weight: 500; }
      .nav-links a:hover { opacity: 1; }
      .hero {
        background: linear-gradient(135deg, ${p.primaryColor}22, ${p.secondaryColor}11);
        padding: 6rem 0;
        text-align: center;
        border-bottom: 1px solid ${p.cardBorder};
      }
      .hero h1 { font-size: clamp(2rem, 5vw, 3.5rem); font-weight: 800; margin-bottom: 1rem; line-height: 1.2; }
      .hero p { font-size: 1.25rem; opacity: 0.75; max-width: 600px; margin: 0 auto 2rem; }
      .btn {
        display: inline-block; padding: 0.85rem 2rem;
        background: linear-gradient(135deg, ${p.primaryColor}, ${p.secondaryColor});
        color: #fff; border: none; border-radius: 0.6rem; font-size: 1rem;
        font-weight: 600; cursor: pointer; transition: transform 0.2s, box-shadow 0.2s;
        box-shadow: 0 4px 15px ${p.primaryColor}55;
      }
      .btn:hover { transform: translateY(-2px); box-shadow: 0 8px 25px ${p.primaryColor}77; }
      .btn-outline {
        background: transparent; border: 2px solid ${p.primaryColor};
        color: ${p.primaryColor}; box-shadow: none;
      }
      .btn-outline:hover { background: ${p.primaryColor}; color: #fff; }
      .section { padding: 5rem 0; }
      .section-title { font-size: 2rem; font-weight: 700; text-align: center; margin-bottom: 0.5rem; }
      .section-sub { text-align: center; opacity: 0.65; margin-bottom: 3rem; }
      .grid-3 { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 1.5rem; }
      .grid-2 { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 2rem; }
      .card {
        background: ${p.cardBg}; border: 1px solid ${p.cardBorder};
        border-radius: 1rem; padding: 2rem;
        transition: transform 0.2s, box-shadow 0.2s;
      }
      .card:hover { transform: translateY(-4px); box-shadow: 0 12px 40px rgba(0,0,0,0.12); }
      .card h3 { font-size: 1.2rem; font-weight: 700; margin-bottom: 0.5rem; }
      .card p { opacity: 0.7; font-size: 0.95rem; }
      .badge {
        display: inline-block; padding: 0.25rem 0.75rem;
        background: ${p.primaryColor}22; color: ${p.primaryColor};
        border-radius: 999px; font-size: 0.8rem; font-weight: 600; margin-bottom: 1rem;
      }
      .accent { color: ${p.primaryColor}; }
      footer {
        background: ${p.isDark ? '#020617' : '#1e293b'};
        color: #94a3b8; text-align: center;
        padding: 2.5rem 0; margin-top: 2rem; font-size: 0.9rem;
      }
      @media (max-width: 640px) {
        .nav-links { display: none; }
        .hero { padding: 4rem 0; }
      }
    </style>`
}

const generateTemplates = {
  ecommerce: (description: string) => {
    const p = parsePrompt(description)
    const name = p.extractedName || 'ShopHub'
    // Extract product type from description
    const productMatch = description.match(/(?:for|selling|sell|store for|shop for)\s+([a-zA-Z\s]+?)(?:\s+with|\s+that|,|\.|$)/i)
    const product = productMatch ? productMatch[1].trim() : 'premium products'
    const tagline = `Your destination for ${product}`

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${name}</title>
  ${baseStyles(p)}
</head>
<body>
  <header>
    <nav class="container">
      <div class="nav-logo">🛍️ ${name}</div>
      <div class="nav-links">
        <a href="#">Home</a><a href="#">Products</a><a href="#">Deals</a>
        <a href="#">Cart 🛒</a><a href="#">Account</a>
      </div>
    </nav>
  </header>

  <section class="hero">
    <div class="container">
      <div class="badge">✨ Free shipping on orders over $50</div>
      <h1>${tagline.charAt(0).toUpperCase() + tagline.slice(1)}</h1>
      <p>${p.prompt.length > 20 ? p.prompt : `Discover our curated collection of ${product}. Quality guaranteed.`}</p>
      <div style="display:flex;gap:1rem;justify-content:center;flex-wrap:wrap;">
        <button class="btn">Shop Now</button>
        <button class="btn btn-outline">View Deals</button>
      </div>
    </div>
  </section>

  <section class="section">
    <div class="container">
      <div class="section-title">Why Shop With Us</div>
      <div class="section-sub">Everything you need, delivered to your door</div>
      <div class="grid-3">
        <div class="card">
          <div style="font-size:2rem;margin-bottom:1rem">🚚</div>
          <h3>Fast Delivery</h3>
          <p>Get your ${product} delivered within 2–3 business days, right to your doorstep.</p>
        </div>
        <div class="card">
          <div style="font-size:2rem;margin-bottom:1rem">✅</div>
          <h3>Quality Guaranteed</h3>
          <p>Every item is carefully checked for quality before shipping. 100% satisfaction guaranteed.</p>
        </div>
        <div class="card">
          <div style="font-size:2rem;margin-bottom:1rem">↩️</div>
          <h3>Easy Returns</h3>
          <p>Not happy? Return anything within 30 days — no questions asked.</p>
        </div>
      </div>
    </div>
  </section>

  <section class="section" style="background:${p.primaryColor}11;border-top:1px solid ${p.cardBorder};border-bottom:1px solid ${p.cardBorder}">
    <div class="container">
      <div class="section-title">Featured ${product.charAt(0).toUpperCase() + product.slice(1)}</div>
      <div class="section-sub">Handpicked just for you</div>
      <div class="grid-3">
        ${[1,2,3].map(i => `
        <div class="card" style="text-align:center">
          <div style="height:160px;background:linear-gradient(135deg,${p.primaryColor}22,${p.secondaryColor}22);border-radius:0.75rem;margin-bottom:1rem;display:flex;align-items:center;justify-content:center;font-size:3rem">🛍️</div>
          <h3>${product.charAt(0).toUpperCase() + product.slice(1)} ${['Classic', 'Premium', 'Deluxe'][i-1]}</h3>
          <p style="margin:0.5rem 0">Top-rated choice for quality and value</p>
          <div style="font-size:1.5rem;font-weight:800;color:${p.primaryColor};margin:0.75rem 0">$${[29, 49, 89][i-1]}.99</div>
          <button class="btn" style="width:100%">Add to Cart</button>
        </div>`).join('')}
      </div>
    </div>
  </section>

  <footer>
    <div class="container">
      <p style="font-size:1.1rem;font-weight:600;color:#fff;margin-bottom:0.5rem">${name}</p>
      <p>© 2025 ${name}. All rights reserved. | Generated by Doltsite</p>
    </div>
  </footer>
</body>
</html>`
  },

  portfolio: (description: string) => {
    const p = parsePrompt(description)
    const name = p.extractedName || 'Alex Designer'
    const roleMatch = description.match(/(?:developer|designer|photographer|artist|writer|engineer|consultant|freelancer|creator)/i)
    const role = roleMatch ? roleMatch[0].charAt(0).toUpperCase() + roleMatch[0].slice(1) : 'Creative Professional'
    const specialtyMatch = description.match(/(?:specializ(?:ing|ed) in|expert in|focus(?:ing)? on|working with)\s+([a-zA-Z\s]+?)(?:\s+with|\s+and|,|\.|$)/i)
    const specialty = specialtyMatch ? specialtyMatch[1].trim() : 'modern web experiences'

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${name} — Portfolio</title>
  ${baseStyles(p)}
</head>
<body>
  <header>
    <nav class="container">
      <div class="nav-logo">${name}</div>
      <div class="nav-links">
        <a href="#">About</a><a href="#">Work</a><a href="#">Skills</a><a href="#">Contact</a>
      </div>
    </nav>
  </header>

  <section class="hero">
    <div class="container">
      <div class="badge">Available for freelance work</div>
      <h1>Hi, I'm <span class="accent">${name.split(' ')[0]}</span> 👋</h1>
      <p>${role} specializing in ${specialty}. ${p.prompt.length > 30 ? p.prompt : 'Crafting pixel-perfect experiences that delight users and drive results.'}</p>
      <div style="display:flex;gap:1rem;justify-content:center;flex-wrap:wrap;">
        <button class="btn">View My Work</button>
        <button class="btn btn-outline">Get In Touch</button>
      </div>
    </div>
  </section>

  <section class="section">
    <div class="container">
      <div class="section-title">Featured Projects</div>
      <div class="section-sub">A selection of my recent work</div>
      <div class="grid-2">
        ${['Project Alpha', 'Project Beta', 'Project Gamma', 'Project Delta'].map((proj, i) => `
        <div class="card">
          <div style="height:200px;background:linear-gradient(135deg,${p.primaryColor}${['44','33','55','22'][i]},${p.secondaryColor}${['22','44','22','55'][i]});border-radius:0.75rem;margin-bottom:1.5rem;display:flex;align-items:center;justify-content:center;font-size:3rem">${['🌐','📱','🎨','⚡'][i]}</div>
          <div class="badge">${['Web App', 'Mobile', 'UI/UX', 'Tool'][i]}</div>
          <h3>${proj}</h3>
          <p>A ${specialty} project focused on performance, accessibility, and stunning visuals.</p>
          <a href="#" class="btn" style="margin-top:1rem;display:inline-block">View Project →</a>
        </div>`).join('')}
      </div>
    </div>
  </section>

  <section class="section" style="background:${p.primaryColor}11;border-top:1px solid ${p.cardBorder}">
    <div class="container">
      <div class="section-title">Skills & Tools</div>
      <div class="section-sub">Technologies I work with</div>
      <div class="grid-3">
        ${[
          { icon: '💻', title: 'Frontend', skills: 'React, TypeScript, Tailwind CSS, Next.js' },
          { icon: '⚙️', title: 'Backend', skills: 'Node.js, Python, REST APIs, GraphQL' },
          { icon: '🎨', title: 'Design', skills: 'Figma, Adobe XD, Motion Design, Prototyping' },
        ].map(s => `
        <div class="card" style="text-align:center">
          <div style="font-size:2.5rem;margin-bottom:1rem">${s.icon}</div>
          <h3>${s.title}</h3>
          <p>${s.skills}</p>
        </div>`).join('')}
      </div>
    </div>
  </section>

  <footer>
    <div class="container">
      <p style="font-size:1.1rem;font-weight:600;color:#fff;margin-bottom:0.5rem">${name}</p>
      <p>© 2025 ${name}. Built with passion. | Generated by Doltsite</p>
    </div>
  </footer>
</body>
</html>`
  },

  landing: (description: string) => {
    const p = parsePrompt(description)
    const name = p.extractedName || 'LaunchPad'
    const productMatch = description.match(/(?:for|about|that helps?|to help|a tool for|an app for|platform for)\s+([a-zA-Z\s]+?)(?:\s+with|\s+that|,|\.|$)/i)
    const productDesc = productMatch ? productMatch[1].trim() : 'your business'
    const tagline = `The smartest way to ${productDesc}`

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${name}</title>
  ${baseStyles(p)}
</head>
<body>
  <header>
    <nav class="container">
      <div class="nav-logo">🚀 ${name}</div>
      <div class="nav-links">
        <a href="#">Features</a><a href="#">Pricing</a><a href="#">About</a>
        <a href="#" style="background:#fff2;padding:0.4rem 1rem;border-radius:0.5rem;">Get Started</a>
      </div>
    </nav>
  </header>

  <section class="hero" style="padding:8rem 0">
    <div class="container">
      <div class="badge">🎉 Now available — try it free</div>
      <h1>${tagline.charAt(0).toUpperCase() + tagline.slice(1)}</h1>
      <p>${p.prompt.length > 20 ? p.prompt : `${name} gives teams everything they need to succeed — faster, smarter, and without the headaches.`}</p>
      <div style="display:flex;gap:1rem;justify-content:center;flex-wrap:wrap;">
        <button class="btn" style="font-size:1.1rem;padding:1rem 2.5rem">Get Started Free</button>
        <button class="btn btn-outline">Watch Demo ▶</button>
      </div>
      <p style="margin-top:1.5rem;opacity:0.5;font-size:0.85rem">No credit card required · Cancel anytime</p>
    </div>
  </section>

  <section class="section">
    <div class="container">
      <div class="section-title">Everything you need</div>
      <div class="section-sub">Powerful features built for modern teams</div>
      <div class="grid-3">
        ${[
          { icon: '⚡', title: 'Lightning Fast', desc: `Built for speed. ${name} loads in milliseconds and never slows you down.` },
          { icon: '🔒', title: 'Secure by Default', desc: 'Enterprise-grade encryption and compliance baked in from day one.' },
          { icon: '🤝', title: 'Team Collaboration', desc: 'Work together in real-time with powerful sharing and commenting tools.' },
          { icon: '📊', title: 'Advanced Analytics', desc: 'Understand your data with beautiful, actionable dashboards.' },
          { icon: '🔗', title: 'Integrations', desc: 'Connect with 100+ tools including Slack, Notion, GitHub, and more.' },
          { icon: '📱', title: 'Mobile Ready', desc: 'Full-featured mobile apps for iOS and Android included.' },
        ].map(f => `
        <div class="card">
          <div style="font-size:2rem;margin-bottom:0.75rem">${f.icon}</div>
          <h3>${f.title}</h3>
          <p>${f.desc}</p>
        </div>`).join('')}
      </div>
    </div>
  </section>

  <section class="section" style="background:linear-gradient(135deg,${p.primaryColor},${p.secondaryColor});color:#fff;text-align:center">
    <div class="container">
      <h2 style="font-size:2.5rem;font-weight:800;margin-bottom:1rem">Ready to get started?</h2>
      <p style="opacity:0.85;font-size:1.1rem;margin-bottom:2rem">Join thousands of teams already using ${name}</p>
      <button class="btn" style="background:#fff;color:${p.primaryColor};font-size:1.1rem;padding:1rem 2.5rem">Start for Free →</button>
    </div>
  </section>

  <footer>
    <div class="container">
      <p style="font-size:1.1rem;font-weight:600;color:#fff;margin-bottom:0.5rem">🚀 ${name}</p>
      <p>© 2025 ${name}. All rights reserved. | Generated by Doltsite</p>
    </div>
  </footer>
</body>
</html>`
  },

  blog: (description: string) => {
    const p = parsePrompt(description)
    const name = p.extractedName || 'The Daily Read'
    const topicMatch = description.match(/(?:about|covering|focused on|dedicated to|on the topic of)\s+([a-zA-Z\s]+?)(?:\s+with|\s+and|,|\.|$)/i)
    const topic = topicMatch ? topicMatch[1].trim() : 'technology and innovation'
    const authorMatch = description.match(/(?:by|author|written by|from)\s+([A-Z][a-zA-Z\s]+?)(?:\s+about|,|\.|$)/i)
    const author = authorMatch ? authorMatch[1].trim() : 'The Editorial Team'

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${name}</title>
  ${baseStyles(p)}
</head>
<body>
  <header>
    <nav class="container">
      <div class="nav-logo">✍️ ${name}</div>
      <div class="nav-links">
        <a href="#">Home</a><a href="#">Articles</a><a href="#">Topics</a>
        <a href="#">Newsletter</a><a href="#">About</a>
      </div>
    </nav>
  </header>

  <section class="hero" style="padding:5rem 0;text-align:left">
    <div class="container">
      <div class="badge">📰 ${topic.charAt(0).toUpperCase() + topic.slice(1)}</div>
      <h1>Insights on <span class="accent">${topic}</span></h1>
      <p>${p.prompt.length > 20 ? p.prompt : `Deep dives, expert analysis, and practical guides on ${topic} — written for curious minds.`}</p>
      <button class="btn">Start Reading</button>
    </div>
  </section>

  <section class="section">
    <div class="container">
      <div style="display:grid;grid-template-columns:2fr 1fr;gap:3rem;align-items:start">
        <div>
          <div class="section-title" style="text-align:left;margin-bottom:2rem">Latest Articles</div>
          ${[
            { tag: 'Deep Dive', title: `The Complete Guide to ${topic.charAt(0).toUpperCase() + topic.slice(1)}`, mins: 12 },
            { tag: 'Opinion', title: `Why ${topic} is Changing Everything in 2025`, mins: 7 },
            { tag: 'Tutorial', title: `Getting Started with ${topic}: A Practical Introduction`, mins: 15 },
            { tag: 'Analysis', title: `The Future of ${topic}: Trends and Predictions`, mins: 9 },
          ].map(a => `
          <div class="card" style="margin-bottom:1.5rem;display:flex;gap:1.5rem;align-items:flex-start">
            <div style="min-width:80px;height:80px;background:linear-gradient(135deg,${p.primaryColor}33,${p.secondaryColor}22);border-radius:0.75rem;display:flex;align-items:center;justify-content:center;font-size:2rem">📄</div>
            <div>
              <div class="badge">${a.tag}</div>
              <h3 style="margin-bottom:0.5rem">${a.title}</h3>
              <p style="font-size:0.85rem">By ${author} · ${a.mins} min read</p>
              <a href="#" style="color:${p.primaryColor};font-weight:600;font-size:0.9rem;margin-top:0.5rem;display:inline-block">Read More →</a>
            </div>
          </div>`).join('')}
        </div>
        <div>
          <div class="card" style="margin-bottom:1.5rem">
            <h3 style="margin-bottom:1rem">🔥 Popular Topics</h3>
            ${['AI & Machine Learning','Product Design','Open Source','Career Growth','Tools & Productivity'].map(t =>
              `<div style="padding:0.5rem 0;border-bottom:1px solid ${p.cardBorder};cursor:pointer">→ ${t}</div>`
            ).join('')}
          </div>
          <div class="card" style="background:linear-gradient(135deg,${p.primaryColor},${p.secondaryColor});color:#fff">
            <h3 style="margin-bottom:0.75rem">📬 Newsletter</h3>
            <p style="opacity:0.9;margin-bottom:1rem;font-size:0.95rem">Get the best articles on ${topic} in your inbox weekly.</p>
            <input type="email" placeholder="your@email.com" style="width:100%;padding:0.6rem;border-radius:0.5rem;border:none;margin-bottom:0.75rem;font-size:0.9rem">
            <button class="btn" style="width:100%;background:#fff;color:${p.primaryColor}">Subscribe Free</button>
          </div>
        </div>
      </div>
    </div>
  </section>

  <footer>
    <div class="container">
      <p style="font-size:1.1rem;font-weight:600;color:#fff;margin-bottom:0.5rem">✍️ ${name}</p>
      <p>© 2025 ${name}. All rights reserved. | Generated by Doltsite</p>
    </div>
  </footer>
</body>
</html>`
  },

  saas: (description: string) => {
    const p = parsePrompt(description)
    const name = p.extractedName || 'CloudPro'
    const productMatch = description.match(/(?:for|that helps?|to|platform for|tool for|software for)\s+([a-zA-Z\s]+?)(?:\s+with|\s+that|,|\.|$)/i)
    const useCase = productMatch ? productMatch[1].trim() : 'modern teams'
    const tagline = `The platform built for ${useCase}`

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${name} — SaaS Platform</title>
  ${baseStyles(p)}
</head>
<body>
  <header>
    <nav class="container">
      <div class="nav-logo">⚙️ ${name}</div>
      <div class="nav-links">
        <a href="#">Product</a><a href="#">Pricing</a><a href="#">Docs</a><a href="#">Blog</a>
        <a href="#" style="background:#fff2;padding:0.4rem 1rem;border-radius:0.5rem;">Sign In</a>
      </div>
    </nav>
  </header>

  <section class="hero" style="padding:8rem 0">
    <div class="container">
      <div class="badge">⚙️ Now in public beta</div>
      <h1>${tagline.charAt(0).toUpperCase() + tagline.slice(1)}</h1>
      <p>${p.prompt.length > 20 ? p.prompt : `${name} gives ${useCase} everything they need in one powerful platform.`}</p>
      <div style="display:flex;gap:1rem;justify-content:center;flex-wrap:wrap;">
        <button class="btn" style="font-size:1.1rem;padding:1rem 2.5rem">Start Free Trial</button>
        <button class="btn btn-outline">Book a Demo</button>
      </div>
      <p style="margin-top:1.5rem;opacity:0.5;font-size:0.85rem">14-day free trial · No credit card · Cancel anytime</p>
    </div>
  </section>

  <section class="section">
    <div class="container">
      <div class="section-title">Simple, transparent pricing</div>
      <div class="section-sub">Choose the plan that fits your team</div>
      <div class="grid-3">
        ${[
          { plan: 'Starter', price: '$19', period: '/mo', desc: `Perfect for individuals and small ${useCase}`, features: ['Up to 5 users','10GB storage','Email support','Core features'] },
          { plan: 'Pro', price: '$79', period: '/mo', desc: `For growing teams who need more power`, features: ['Unlimited users','100GB storage','Priority support','Advanced analytics','API access'], popular: true },
          { plan: 'Enterprise', price: 'Custom', period: '', desc: 'For large organizations with custom needs', features: ['Unlimited everything','Dedicated support','Custom integrations','SLA guarantee','On-premise option'] },
        ].map(plan => `
        <div class="card" style="${plan.popular ? `border-color:${p.primaryColor};box-shadow:0 0 0 2px ${p.primaryColor}33` : ''}">
          ${plan.popular ? `<div class="badge" style="background:${p.primaryColor};color:#fff;margin-bottom:1rem">Most Popular</div>` : '<div style="height:2rem"></div>'}
          <h3>${plan.plan}</h3>
          <div style="font-size:2.5rem;font-weight:800;margin:0.75rem 0;color:${p.primaryColor}">${plan.price}<span style="font-size:1rem;opacity:0.6">${plan.period}</span></div>
          <p style="margin-bottom:1.5rem">${plan.desc}</p>
          <ul style="list-style:none;margin-bottom:2rem">
            ${plan.features.map(f => `<li style="padding:0.35rem 0">✓ ${f}</li>`).join('')}
          </ul>
          <button class="btn ${plan.popular ? '' : 'btn-outline'}" style="width:100%">${plan.price === 'Custom' ? 'Contact Sales' : 'Get Started'}</button>
        </div>`).join('')}
      </div>
    </div>
  </section>

  <section class="section" style="background:${p.primaryColor}11;border-top:1px solid ${p.cardBorder}">
    <div class="container">
      <div class="section-title">Trusted by teams everywhere</div>
      <div class="grid-3" style="margin-top:2rem">
        ${[
          { quote: `${name} completely changed how we work. We saved 10 hours a week.`, name: 'Sarah K.', role: 'Product Manager' },
          { quote: `The best investment we made this year. Setup took under 5 minutes.`, name: 'James L.', role: 'CTO' },
          { quote: `Incredible support team. They helped us migrate everything seamlessly.`, name: 'Priya M.', role: 'Engineering Lead' },
        ].map(t => `
        <div class="card">
          <div style="font-size:1.5rem;margin-bottom:1rem">⭐⭐⭐⭐⭐</div>
          <p style="font-style:italic;margin-bottom:1rem">"${t.quote}"</p>
          <div style="font-weight:700">${t.name}</div>
          <div style="opacity:0.6;font-size:0.85rem">${t.role}</div>
        </div>`).join('')}
      </div>
    </div>
  </section>

  <footer>
    <div class="container">
      <p style="font-size:1.1rem;font-weight:600;color:#fff;margin-bottom:0.5rem">⚙️ ${name}</p>
      <p>© 2025 ${name}. All rights reserved. | Generated by Doltsite</p>
    </div>
  </footer>
</body>
</html>`
  },

  corporate: (description: string) => {
    const p = parsePrompt(description)
    const name = p.extractedName || 'Apex Global'
    const industryMatch = description.match(/(?:in|for|specializing in|operating in|focused on)\s+([a-zA-Z\s]+?)(?:\s+industry|\s+sector|\s+with|,|\.|$)/i)
    const industry = industryMatch ? industryMatch[1].trim() : 'business solutions'
    const tagline = `Leading the future of ${industry}`

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${name}</title>
  ${baseStyles(p)}
</head>
<body>
  <header>
    <nav class="container">
      <div class="nav-logo">🏢 ${name}</div>
      <div class="nav-links">
        <a href="#">About</a><a href="#">Services</a><a href="#">Industries</a>
        <a href="#">Insights</a><a href="#">Careers</a><a href="#">Contact</a>
      </div>
    </nav>
  </header>

  <section class="hero" style="padding:8rem 0;text-align:left">
    <div class="container" style="max-width:800px">
      <div class="badge">EST. 2005 · 20+ Years of Excellence</div>
      <h1>${tagline.charAt(0).toUpperCase() + tagline.slice(1)}</h1>
      <p>${p.prompt.length > 20 ? p.prompt : `${name} is a global leader in ${industry}, delivering innovative solutions that transform organizations and drive sustainable growth.`}</p>
      <div style="display:flex;gap:1rem;flex-wrap:wrap;">
        <button class="btn" style="font-size:1.1rem;padding:1rem 2.5rem">Our Services</button>
        <button class="btn btn-outline">Contact Us</button>
      </div>
    </div>
  </section>

  <section class="section">
    <div class="container">
      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:1.5rem;text-align:center;margin-bottom:5rem">
        ${[
          { num: '500+', label: 'Clients Worldwide' },
          { num: '20+', label: 'Years of Experience' },
          { num: '95%', label: 'Client Satisfaction' },
          { num: '50+', label: 'Countries Served' },
        ].map(s => `
        <div style="padding:2rem;background:${p.primaryColor}11;border-radius:1rem;border:1px solid ${p.cardBorder}">
          <div style="font-size:2.5rem;font-weight:800;color:${p.primaryColor}">${s.num}</div>
          <div style="opacity:0.7;margin-top:0.25rem">${s.label}</div>
        </div>`).join('')}
      </div>

      <div class="section-title">Our Services</div>
      <div class="section-sub">Comprehensive solutions for ${industry}</div>
      <div class="grid-3">
        ${[
          { icon: '📊', title: 'Strategic Consulting', desc: `Expert guidance to navigate complex challenges in ${industry} and achieve measurable outcomes.` },
          { icon: '🔧', title: 'Implementation', desc: 'End-to-end deployment of enterprise-grade solutions tailored to your specific needs.' },
          { icon: '🤝', title: 'Managed Services', desc: 'Ongoing operations and support to keep your systems running at peak performance.' },
          { icon: '🎓', title: 'Training & Development', desc: 'Empower your teams with the knowledge and skills to excel in a changing landscape.' },
          { icon: '🔬', title: 'Research & Innovation', desc: 'Cutting-edge R&D to help you stay ahead of trends in the ${industry} space.' },
          { icon: '🌍', title: 'Global Delivery', desc: 'Seamless execution across time zones with local expertise in 50+ countries.' },
        ].map(s => `
        <div class="card">
          <div style="font-size:2rem;margin-bottom:1rem">${s.icon}</div>
          <h3>${s.title}</h3>
          <p>${s.desc}</p>
          <a href="#" style="color:${p.primaryColor};font-weight:600;margin-top:1rem;display:inline-block">Learn More →</a>
        </div>`).join('')}
      </div>
    </div>
  </section>

  <section class="section" style="background:linear-gradient(135deg,${p.primaryColor},${p.secondaryColor});color:#fff;text-align:center">
    <div class="container">
      <h2 style="font-size:2.5rem;font-weight:800;margin-bottom:1rem">Let's Build the Future Together</h2>
      <p style="opacity:0.85;font-size:1.1rem;margin-bottom:2rem">Speak with one of our ${industry} experts today</p>
      <button class="btn" style="background:#fff;color:${p.primaryColor};font-size:1.1rem;padding:1rem 2.5rem">Schedule a Consultation →</button>
    </div>
  </section>

  <footer>
    <div class="container">
      <p style="font-size:1.1rem;font-weight:600;color:#fff;margin-bottom:0.5rem">🏢 ${name}</p>
      <p>© 2025 ${name}. All rights reserved. | Generated by Doltsite</p>
    </div>
  </footer>
</body>
</html>`
  },
}

/** Auto-detect the best layout type from the description */
function detectTemplate(description: string): keyof typeof generateTemplates {
  const d = description.toLowerCase()

  if (/shop|store|buy|sell|product|ecommerc|cart|checkout|price|order|delivery/i.test(d)) return 'ecommerce'
  if (/portfolio|my work|projects|designer|developer|photographer|artist|freelance|showcase/i.test(d)) return 'portfolio'
  if (/blog|article|post|newsletter|magazine|news|write|author|editorial/i.test(d)) return 'blog'
  if (/saas|software|platform|app|tool|dashboard|subscription|trial|api/i.test(d)) return 'saas'
  if (/corporate|company|enterprise|firm|agency|business|consulting|global|services/i.test(d)) return 'corporate'
  // Default to landing page for anything else
  return 'landing'
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { description } = body

    if (!description || !description.trim()) {
      return NextResponse.json(
        { error: 'Please enter what you want to create' },
        { status: 400 }
      )
    }

    // ── Account-based auth (required) ────────────────────────────────────────
    const token = request.cookies.get('doltsite-token')?.value
    if (!token) {
      return NextResponse.json(
        { error: 'auth_required', message: 'Please create a free account to generate websites.' },
        { status: 401 }
      )
    }

    const accountId = await verifyJWT(token)
    if (!accountId) {
      return NextResponse.json(
        { error: 'invalid_token', message: 'Invalid or expired token.' },
        { status: 401 }
      )
    }

    const account = await findAccountById(accountId)
    if (!account) {
      return NextResponse.json(
        { error: 'account_not_found', message: 'Account not found.' },
        { status: 404 }
      )
    }

    // Generate HTML using the template system
    const detectedTemplate = detectTemplate(description)
    const generatorFn = (prompt: string) => ({
      html: generateTemplates[detectedTemplate](prompt),
      template: detectedTemplate,
    })

    // Use the controlled pipeline
    const result = await generateWebsiteControlled(
      accountId,
      description,
      generatorFn
    )

    if (!result.success) {
      // Map errors to appropriate HTTP status codes
      if (result.error === 'access_denied') {
        return NextResponse.json(
          { 
            error: 'limit_reached', 
            message: result.message,
            tier: account.tier,
            usage: account.usage,
          },
          { status: 403 }
        )
      }
      if (result.error === 'concurrent_request') {
        return NextResponse.json(
          { error: 'concurrent_request', message: result.message },
          { status: 429 }
        )
      }
      return NextResponse.json(
        { error: result.error || 'generation_failed', message: result.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      html: result.html,
      template: result.template,
      message: result.message,
      usage: result.usage,
      tier: result.tier,
    })
  } catch (error) {
    console.error('Error in /api/generate:', error)
    return NextResponse.json(
      { 
        error: 'generation_error',
        message: 'We encountered an error generating your website. Please try again or contact support.',
      },
      { status: 500 }
    )
  }
}

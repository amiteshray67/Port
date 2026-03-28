#!/usr/bin/env python3
"""
Rebuild ideas/index.html — matches the main amiteshray.com nav, footer, and dark mode exactly.
Run: python3 /Users/amiteshray/Desktop/GIT/Port/ideas/_rebuild_index.py
"""
import os, re

ideas_dir = os.path.dirname(os.path.abspath(__file__))
pages = []

for f in sorted(os.listdir(ideas_dir)):
    if f.endswith(".html") and f not in ("index.html",) and not f.startswith("_"):
        slug = f[:-5]
        with open(os.path.join(ideas_dir, f), encoding="utf-8") as fh:
            content = fh.read()
        title_m = re.search(r"<title>(.*?)</title>", content, re.I)
        title = title_m.group(1).split("—")[0].strip() if title_m else slug.replace("-"," ").title()
        desc_m = re.search(r'<meta name="description" content="(.*?)"', content, re.I)
        desc = desc_m.group(1) if desc_m else ""
        date_m = re.search(r"Analysed\s+([\w]+\s+\d{4})", content)
        date_s = date_m.group(1) if date_m else "2026"
        score_m = re.search(r"(\d+)/10", content)
        score = score_m.group(0) if score_m else ""
        # Try to extract verdict
        verdict_m = re.search(r"Verdict:\s*(Build It|Revisit|Pass)", content)
        verdict = verdict_m.group(1) if verdict_m else ""
        pages.append({"slug": slug, "title": title, "desc": desc, "date": date_s, "score": score, "verdict": verdict})

cards = ""
for p in pages:
    badge = f'<span class="score-badge">{p["score"]}</span>' if p["score"] else ""
    verdict_cls = "green" if p["verdict"] == "Build It" else "amber" if p["verdict"] == "Revisit" else "red" if p["verdict"] == "Pass" else ""
    verdict_tag = f'<span class="verdict-tag {verdict_cls}">{p["verdict"]}</span>' if p["verdict"] else ""
    cards += f"""
      <a href="/ideas/{p['slug']}.html" class="idea-card">
        <div class="card-top">
          <span class="card-date">{p['date']}</span>
          <div class="card-badges">{verdict_tag}{badge}</div>
        </div>
        <h2>{p['title']}</h2>
        <p>{p['desc'][:160]}{'...' if len(p['desc']) > 160 else ''}</p>
        <span class="card-link">Read full analysis <i class="fas fa-arrow-right"></i></span>
      </a>"""

count = len(pages)

html = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Ideas Lab — Amitesh Ray</title>
  <meta name="description" content="Raw startup ideas researched and stress-tested by Amitesh Ray — market sizing, viability scores, and roadmaps."/>
  <link rel="preconnect" href="https://fonts.googleapis.com"/>
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&family=Raleway:wght@300;400;500;600;700&display=swap" rel="stylesheet"/>
  <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet"/>
  <style>
    *, *::before, *::after {{ box-sizing: border-box; margin: 0; padding: 0; }}

    :root {{
      --primary-color: #6366f1;
      --primary-color-dark: #4f46e5;
      --secondary-color: #8b5cf6;
      --text-color: #1f2937;
      --text-color-light: #4b5563;
      --text-muted: #9ca3af;
      --background-color: #ffffff;
      --background-color-alt: #f9fafb;
      --card-background: #ffffff;
      --border-color: #e5e7eb;
      --shadow-color: rgba(0, 0, 0, 0.1);
      --header-height: 70px;
      --green: #10b981; --amber: #f59e0b; --red: #ef4444;
    }}

    .dark-mode {{
      --primary-color: #8b5cf6;
      --primary-color-dark: #7c3aed;
      --secondary-color: #6366f1;
      --text-color: #f9fafb;
      --text-color-light: #d1d5db;
      --background-color: #111827;
      --background-color-alt: #1f2937;
      --card-background: #1f2937;
      --border-color: #374151;
      --shadow-color: rgba(0, 0, 0, 0.3);
    }}

    html {{ scroll-behavior: smooth; }}
    body {{
      font-family: 'Poppins', sans-serif;
      background: var(--background-color);
      color: var(--text-color);
      line-height: 1.7;
      transition: background-color 0.3s, color 0.3s;
    }}

    /* ── HEADER (matches main site) ── */
    header {{
      position: fixed; top: 0; left: 0; right: 0; z-index: 100;
      background: var(--background-color);
      border-bottom: 1px solid var(--border-color);
      transition: background 0.3s;
    }}
    .header-container {{
      max-width: 1200px; margin: 0 auto;
      padding: 0 2rem; height: var(--header-height);
      display: flex; align-items: center; justify-content: space-between;
    }}
    .logo {{
      font-family: 'Raleway', sans-serif; font-weight: 700;
      font-size: 1.5rem; color: var(--primary-color); text-decoration: none;
    }}
    .logo span {{ font-weight: 300; }}
    .nav-links {{ display: flex; gap: 30px; list-style: none; }}
    .nav-links a {{
      font-size: 0.9rem; font-weight: 500;
      color: var(--text-color-light); text-decoration: none;
      transition: color 0.3s;
    }}
    .nav-links a:hover, .nav-links a.active {{ color: var(--primary-color); }}
    .dark-mode-toggle {{
      background: none; border: none; cursor: pointer;
      width: 40px; height: 40px; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      color: var(--text-color); font-size: 1.1rem;
      transition: background 0.3s;
    }}
    .dark-mode-toggle:hover {{ background: var(--background-color-alt); }}
    .hamburger {{
      display: none; background: none; border: none; cursor: pointer;
      flex-direction: column; gap: 5px; padding: 5px;
    }}
    .hamburger span {{
      display: block; width: 24px; height: 2px;
      background: var(--text-color); transition: 0.3s;
    }}

    /* ── MAIN ── */
    main {{
      max-width: 900px; margin: 0 auto;
      padding: calc(var(--header-height) + 40px) 2rem 80px;
    }}

    /* ── HERO ── */
    .hero {{ text-align: center; margin-bottom: 3rem; }}
    .chip {{
      display: inline-block;
      background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
      color: #fff; font-size: 0.72rem; font-weight: 600;
      letter-spacing: 0.08em; text-transform: uppercase;
      border-radius: 100px; padding: 0.3rem 0.9rem; margin-bottom: 1rem;
    }}
    .hero h1 {{
      font-family: 'Raleway', sans-serif;
      font-size: clamp(1.8rem, 5vw, 2.5rem);
      font-weight: 700; margin-bottom: 0.6rem;
    }}
    .hero h1 span {{ color: var(--primary-color); }}
    .hero p {{ color: var(--text-color-light); max-width: 520px; margin: 0 auto; font-size: 0.95rem; }}
    .idea-count {{
      display: inline-block; margin-top: 1rem;
      font-size: 0.82rem; color: var(--text-muted);
    }}

    /* ── IDEA CARDS ── */
    .grid {{
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(290px, 1fr));
      gap: 1.25rem; margin-top: 2rem;
    }}
    .idea-card {{
      display: block; text-decoration: none; color: inherit;
      background: var(--card-background);
      border: 1px solid var(--border-color);
      border-radius: 12px; padding: 1.5rem;
      transition: box-shadow 0.2s, transform 0.2s;
    }}
    .idea-card:hover {{
      box-shadow: 0 8px 32px var(--shadow-color);
      transform: translateY(-3px);
    }}
    .card-top {{
      display: flex; align-items: center; justify-content: space-between;
      margin-bottom: 0.6rem;
    }}
    .card-date {{ font-size: 0.75rem; color: var(--text-muted); }}
    .card-badges {{ display: flex; gap: 0.4rem; align-items: center; }}
    .score-badge {{
      background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
      color: #fff; font-size: 0.7rem; font-weight: 700;
      border-radius: 100px; padding: 0.15rem 0.55rem;
    }}
    .verdict-tag {{
      font-size: 0.68rem; font-weight: 600; border-radius: 100px;
      padding: 0.15rem 0.55rem;
    }}
    .verdict-tag.green {{ background: #d1fae5; color: #065f46; }}
    .verdict-tag.amber {{ background: #fef3c7; color: #92400e; }}
    .verdict-tag.red {{ background: #fee2e2; color: #991b1b; }}
    .idea-card h2 {{
      font-family: 'Raleway', sans-serif; font-size: 1.1rem;
      font-weight: 700; color: var(--text-color); margin-bottom: 0.4rem;
    }}
    .idea-card p {{
      font-size: 0.84rem; color: var(--text-color-light); margin-bottom: 0.9rem;
    }}
    .card-link {{
      font-size: 0.82rem; font-weight: 600; color: var(--primary-color);
    }}
    .card-link i {{ margin-left: 4px; font-size: 0.7rem; }}
    .empty {{
      text-align: center; color: var(--text-muted);
      padding: 3rem; grid-column: 1 / -1;
    }}

    /* ── FOOTER (matches main site) ── */
    footer {{
      background: var(--background-color-alt);
      padding: 2rem; text-align: center;
      font-size: 0.9rem; color: var(--text-color-light);
      transition: background 0.3s;
    }}

    @media (max-width: 768px) {{
      .nav-links {{ display: none; }}
      .hamburger {{ display: flex; }}
      .header-container {{ padding: 0 1.25rem; }}
      main {{ padding: calc(var(--header-height) + 20px) 1.25rem 60px; }}
    }}
  </style>
</head>
<body>

<header>
  <div class="header-container">
    <a href="/" class="logo">Amitesh <span>Ray</span></a>
    <nav class="nav-links">
      <a href="/#about">About</a>
      <a href="/#experience">Experience</a>
      <a href="/#education">Education</a>
      <a href="/#certifications">Certifications</a>
      <a href="/#tools">Financial Tools</a>
      <a href="/ideas/" class="active">Ideas</a>
      <a href="/#contact">Contact</a>
    </nav>
    <div style="display:flex;align-items:center;gap:10px;">
      <button class="dark-mode-toggle" id="darkModeToggle">
        <i class="fas fa-moon"></i>
      </button>
      <button class="hamburger" id="hamburger">
        <span></span><span></span><span></span>
      </button>
    </div>
  </div>
</header>

<main>
  <div class="hero">
    <div class="chip">Ideas Lab</div>
    <h1>Raw Ideas, <span>Stress-Tested</span></h1>
    <p>Every idea gets fully researched — market size, competitors, a viability score, and a roadmap.</p>
    <span class="idea-count">{count} idea{'s' if count != 1 else ''} analysed</span>
  </div>
  <div class="grid">{cards if pages else '<div class="empty"><p>No ideas published yet. Drop one in Cowork to get started.</p></div>'}
  </div>
</main>

<footer>
  <div class="container">
    <p>&copy; 2024 Amitesh Ray. All rights reserved.</p>
  </div>
</footer>

<script>
  const body = document.body;
  const toggle = document.getElementById('darkModeToggle');
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.querySelector('.nav-links');

  function updateIcon() {{
    toggle.innerHTML = body.classList.contains('dark-mode')
      ? '<i class="fas fa-sun"></i>'
      : '<i class="fas fa-moon"></i>';
  }}

  const saved = localStorage.getItem('theme');
  if (saved) {{ body.classList.add(saved); updateIcon(); }}

  toggle.addEventListener('click', () => {{
    body.classList.toggle('dark-mode');
    localStorage.setItem('theme', body.classList.contains('dark-mode') ? 'dark-mode' : '');
    updateIcon();
  }});

  if (hamburger) {{
    hamburger.addEventListener('click', () => {{
      navLinks.classList.toggle('active');
    }});
  }}
</script>

</body>
</html>"""

out = os.path.join(ideas_dir, "index.html")
with open(out, "w", encoding="utf-8") as fh:
    fh.write(html)
print(f"index.html rebuilt — {count} idea(s)")

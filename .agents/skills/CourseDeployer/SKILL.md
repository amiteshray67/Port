---
name: CourseDeployer
description: Deploys brand new single-file HTML interactive tools directly to the portfolio (amiteshray.com/studyhub/). Automates image extraction, theme alignment, asset linkage, UI injection, and GitHub deployment in one click.
---

# CourseDeployer

This skill automates the heavy-lifting required to transform a bulky, self-contained single-file HTML study tool into a lean, production-ready page inside the portfolio website's `studyhub` repository.

**Trigger Phrases**: "Use CourseDeployer on this tool", "Deploy this new tool to the portfolio", "Push this newly generated course to my GitHub site".

## Prerequisites and Inputs
- Git configured with push access to `https://github.com/amiteshray67/Port.git`.
- You must ask the user for:
  1. **Source file** — Absolute path to the original massive HTML tool.
  2. **URL slug** — e.g., `nism-derivatives`, `frm-part1`.
  3. **Display properties** — Name, Subtitle, Description, Tags, and an Emoji icon for the `studyhub/index.html` card grid.

## Comprehensive Execution Workflow

You must perform these exact steps every single time:

### Step 1: Pre-processing & Asset Extraction
1. The source HTML is likely massive (25MB+) because images and explainers are injected as base64 or heavy JSON objects.
2. Read the source `html` file.
3. **Extract Notes**: Find massive base64 arrays (like `PAGE_IMAGES`). Save the decoded binary data or strings to dedicated files inside `_port_repo/studyhub/assets/notes/<slug>-<number>.jpg`.
4. **Extract Explainers**: Find heavy data arrays (like `SEED_EXPLAINERS`). Move the JavaScript logic out into a new file: `_port_repo/studyhub/assets/<slug>_data.js`.
   - **CRITICAL RULE**: When stringifying HTML or JSON into the extracted `.js` arrays, you must explicitly replace/escape all literal newlines `\n` and carriage returns `\r` (i.e. `replace(/\n/g, "\\n")`) before inserting them, or you will cause an `Invalid or unexpected token` `SyntaxError`.

### Step 2: HTML Mutation
Modify the stripped HTML file with the following injections:
1. **Asset Links**: Update all references from `PAGE_IMAGES[...]` to standard `<img src="./assets/notes/...">` or relative array paths. Add `<script src="./assets/<slug>_data.js"></script>` to the `<head>` or bottom of `<body>`.
2. **Theme Alignment**: Find and replace all hardcoded accent colors to match the portfolio UI:
   - Replace `#6366f1` with `#6c5ce7` (primary purple).
   - Replace `#8b5cf6` with `#a29bfe` (secondary purple).
3. **Typography**: Inject the Google Fonts link into the `<head>`:
   ```html
   <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&family=Raleway:wght@300;400;500;600;700&display=swap" rel="stylesheet">
   ```
   Prefix `'Poppins',` to the CSS `font-family` on the `body`.
4. **Back-Nav Bar Integration**: Insert the following UI strip immediately after the opening `<body>` tag so users can return to the main portfolio:
   ```html
   <div id="back-nav" style="width:100%;background:linear-gradient(135deg,#6c5ce7,#a29bfe);padding:8px 20px;display:flex;align-items:center;justify-content:space-between;font-family:'Poppins',sans-serif;flex-shrink:0;z-index:9999;">
     <a href="https://amiteshray.com" style="color:white;text-decoration:none;font-size:13px;font-weight:500;display:flex;align-items:center;gap:6px;opacity:0.9;" onmouseover="this.style.opacity='1'" onmouseout="this.style.opacity='0.9'">← Back to amiteshray.com</a>
     <span style="color:rgba(255,255,255,0.7);font-size:11px;font-weight:500;">Study Hub · DISPLAY_NAME</span>
   </div>
   ```

### Step 3: Application Assembly
1. Save the mutated HTML file to `_port_repo/studyhub/<slug>.html`.
2. Open `_port_repo/studyhub/index.html`.
3. Locate the `.courses-grid` container. Add a new card entry using this exact HTML template:
   ```html
   <a href="./<slug>.html" class="course-card">
     <div class="card-header">
       <div class="card-icon">ICON</div>
       <div>
         <div class="card-title">DISPLAY_NAME</div>
         <div class="card-subtitle">SUBTITLE</div>
       </div>
     </div>
     <div class="card-desc">DESCRIPTION</div>
     <div class="card-tags">
       <span class="tag">TAG1</span>
       <span class="tag">TAG2</span>
     </div>
     <div class="card-footer">
       <div class="card-meta"><i class="fas fa-book"></i> Study Tool</div>
       <span class="open-btn">Open Hub <i class="fas fa-arrow-right"></i></span>
     </div>
   </a>
   ```

### Step 4: Validate and Deploy
1. Run syntax validations (`node -c`) on your extracted JS files to guarantee no execution halts occur.
2. Execute the deployment sequence:
   ```bash
   git add -A
   git commit -m "feat(studyhub): deploy new <DISPLAY_NAME> study course"
   git push origin main
   ```
3. Notify the user they can access the live tool at `https://amiteshray.com/studyhub/<slug>.html` within an estimated 1-2 minutes!

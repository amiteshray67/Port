---
name: StudyHubUpdater
description: >-
  Universal updater for the CFA Study Hub at amiteshray.com/studyhub. Automates
  PDF-to-JPG conversion, PAGE_IMAGES + INDEX updates, Downloads section, FTP
  deployment, and git commit/push. Trigger on "add this note to studyhub",
  "update the CFA hub", "add this explainer", "push new content to cfa-l2".
---

# StudyHubUpdater — Full Pipeline

## Core Architecture

| Asset | Path |
|---|---|
| Study Hub Root | `_port_repo/studyhub/` |
| Notes (images/PDFs) | `_port_repo/studyhub/assets/notes/` |
| Explainers data | `_port_repo/studyhub/assets/seed_explainers.js` |
| Main App UI | `_port_repo/studyhub/cfa-l2.html` |
| Mac repo path | `/Users/amiteshray/Documents/Claude/Projects/CFA PREP/_port_repo` |
| Sandbox repo path | `/sessions/determined-nifty-allen/mnt/CFA PREP/_port_repo` |

**FTP:** server `217.21.90.95` · user `u944949387` · pass `Sphs@05164426082001` · webroot `/domains/amiteshray.com/public_html/`

**KEY CONSTANTS in cfa-l2.html:**
- `PAGE_IMAGES` — maps `"prefix-01"` → `"./assets/notes/prefix-01.jpg"`
- `INDEX` — flashcard entries: `{ id, topic, name, icon, pages:[], source, type, formula, concept, examTip }`
- `initDownloadsView()` — builds the Downloads tab dynamically from `SEED_EXPLAINERS` + `EXPLAINERS`
- `topicNames` map in `initDownloadsView()` — controls display labels for topic groups

**Downloads section behaviour:**
- **PDFs** — static HTML cards in `#v-downloads`. Each new PDF needs a new card added manually to the HTML.
- **Explainers** — rendered automatically by `initDownloadsView()` from `SEED_EXPLAINERS`. No manual HTML change needed, BUT if the new explainer uses a **new topic key** not already in `topicNames`, you must add it there.

**Supported topic keys in `topicNames`** (as of last update):
`equity`, `fi`, `deriv`, `derivatives`, `econ`, `eco`, `economics`, `fsa`, `fra`, `corp`, `corporate`, `alt`, `alts`, `alternatives`, `pm`, `ethics`, `quant`, `quantitative`, `other`

---

## STEP 0 — Always Clear Git Locks First (via osascript)

```applescript
do shell script "rm -f '/Users/amiteshray/Documents/Claude/Projects/CFA PREP/_port_repo/.git/index.lock' '/Users/amiteshray/Documents/Claude/Projects/CFA PREP/_port_repo/.git/HEAD.lock' 2>/dev/null; echo done"
```

If remote has diverged, pull before pushing:
```applescript
do shell script "cd '/Users/amiteshray/Documents/Claude/Projects/CFA PREP/_port_repo' && git pull --rebase origin main 2>&1"
```

---

## Workflow A — New Note PDF (Full Auto-Pipeline)

### Step 1: Copy PDF to sandbox notes folder
```bash
cp <uploaded_file> "/sessions/determined-nifty-allen/mnt/CFA PREP/_port_repo/studyhub/assets/notes/<SubjectName>.pdf"
```

### Step 2: Convert PDF → per-page JPGs
```bash
NOTES_DIR="/sessions/determined-nifty-allen/mnt/CFA PREP/_port_repo/studyhub/assets/notes"
PREFIX="eco"   # change per subject

pdfinfo "$NOTES_DIR/<SubjectName>.pdf" | grep Pages
pdftoppm -jpeg -r 200 -jpegopt quality=88 "$NOTES_DIR/<SubjectName>.pdf" "/tmp/$PREFIX"

# Normalize to 2-digit zero-padded (pdftoppm outputs -1,-2 for small page counts)
for f in /tmp/${PREFIX}-[0-9].jpg; do
  [ -f "$f" ] || continue
  num=$(basename "$f" .jpg | grep -oP '\d+$')
  mv "$f" "/tmp/${PREFIX}-$(printf '%02d' $num).jpg"
done

cp /tmp/${PREFIX}-*.jpg "$NOTES_DIR/"
```

**Source key / JPG prefix table:**
| Subject | source key | JPG prefix |
|---|---|---|
| Economics | `eco` | `eco-` |
| Corporate Issuers | `corp` | `corp-` |
| Derivatives | `deriv` | `deriv-` |
| Commodities | `commodities` | `commodities-` |
| Hedge Funds | `hf` | `hf-` |
| Real Estate | `re` | `re-` |
| Equity | `equity` | `equity-` |
| Fixed Income | `fi` | `fi-` |

### Step 3: Update PAGE_IMAGES in cfa-l2.html
```python
import re

html_path = "/sessions/determined-nifty-allen/mnt/CFA PREP/_port_repo/studyhub/cfa-l2.html"
with open(html_path, "r") as f:
    content = f.read()

prefix = "eco"   # change per subject
page_count = 14  # change per PDF — count files: ls /tmp/eco-*.jpg | wc -l

new_entries = ",".join(
    f'"{prefix}-{i:02d}":"./assets/notes/{prefix}-{i:02d}.jpg"'
    for i in range(1, page_count + 1)
)
content = re.sub(
    r'(const PAGE_IMAGES\s*=\s*\{)([^}]*?)(\})',
    lambda m: m.group(1) + m.group(2) + "," + new_entries + m.group(3),
    content, flags=re.DOTALL
)
with open(html_path, "w") as f:
    f.write(content)
print("PAGE_IMAGES updated")
```

### Step 4: Map pages to INDEX entries
```python
import pdfplumber

notes_dir = "/sessions/determined-nifty-allen/mnt/CFA PREP/_port_repo/studyhub/assets/notes"
with pdfplumber.open(f"{notes_dir}/<SubjectName>.pdf") as pdf:
    for i, page in enumerate(pdf.pages, 1):
        text = page.extract_text() or ""
        print(f"Page {i:02d}: {' '.join(text.split()[:30])[:150]}")

page_assignments = {
    "ec1": [1],
    "ec2": [5],
    "ec3": [2, 4],
    # ...
}

for entry_id, pages in page_assignments.items():
    pages_str = ",".join(str(p) for p in pages)
    pos = content.find(f'id:"{entry_id}"')
    if pos == -1:
        print(f"WARNING: entry {entry_id} not found")
        continue
    window = content[pos:pos+600]
    new_window = re.sub(r'pages:\[\]', f'pages:[{pages_str}]', window, count=1)
    content = content[:pos] + new_window + content[pos+600:]

with open(html_path, "w") as f:
    f.write(content)
print("INDEX pages updated")
```

### Step 4b: Add Download Card to Downloads Section (REQUIRED for every new PDF)

In `cfa-l2.html`, find the `<!-- Notes Download Section -->` grid (inside `#v-downloads`) and add a new card using this template. Fill in icon, subject name, page count, description, filename:

```html
<div style="background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:20px;">
  <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px;">
    <div style="width:44px;height:44px;border-radius:10px;background:linear-gradient(135deg,#6c5ce7,#a29bfe);display:flex;align-items:center;justify-content:center;font-size:20px;">ICON</div>
    <div>
      <div style="font-size:14px;font-weight:700;color:var(--text);">SUBJECT Notes</div>
      <div style="font-size:11px;color:var(--text3);">X pages · Handwritten notes</div>
    </div>
  </div>
  <p style="font-size:12px;color:var(--text2);line-height:1.6;margin-bottom:14px;">SHORT DESCRIPTION of what is covered.</p>
  <a href="./assets/notes/FILENAME.pdf" download="FILENAME.pdf" style="display:block;text-align:center;text-decoration:none;width:100%;padding:10px;background:#6c5ce7;color:white;border:none;border-radius:8px;font-size:12px;font-weight:600;cursor:pointer;transition:all .2s;" onmouseover="this.style.background='#a29bfe'" onmouseout="this.style.background='#6c5ce7'">
    ⬇ Download SUBJECT Notes (PDF file)
  </a>
</div>
```

### Step 5: Validate JS syntax
```bash
node -e "
const fs = require('fs');
const html = fs.readFileSync('/sessions/determined-nifty-allen/mnt/CFA PREP/_port_repo/studyhub/cfa-l2.html', 'utf8');
const m = html.match(/<script>([\s\S]*?)<\/script>/);
if (m) { try { new Function(m[1]); console.log('JS valid'); } catch(e) { console.error('SYNTAX ERROR:', e.message); process.exit(1); } }
"
```

### Step 6: Deploy via FTPS (PRIMARY — always do this first)
```bash
FTP_HOST="217.21.90.95"
FTP_USER="u944949387"
FTP_PASS="Sphs@05164426082001"
FTP_NOTES="/domains/amiteshray.com/public_html/studyhub/assets/notes"
NOTES_DIR="/sessions/determined-nifty-allen/mnt/CFA PREP/_port_repo/studyhub/assets/notes"
PREFIX="eco"   # change per subject

for f in "$NOTES_DIR/${PREFIX}"-*.jpg; do
  fname=$(basename "$f")
  status=$(curl -s -T "$f" --ftp-ssl --insecure --ftp-pasv \
    -u "$FTP_USER:$FTP_PASS" \
    "ftp://$FTP_HOST$FTP_NOTES/$fname" -w "%{http_code}" -o /dev/null)
  echo "$fname → $status"
done

# Also upload the PDF itself
curl -s -T "$NOTES_DIR/<SubjectName>.pdf" --ftp-ssl --insecure --ftp-pasv \
  -u "$FTP_USER:$FTP_PASS" \
  "ftp://$FTP_HOST$FTP_NOTES/<SubjectName>.pdf" -w "PDF: %{http_code}\n" -o /dev/null

# Upload updated cfa-l2.html
curl -s -T "/sessions/determined-nifty-allen/mnt/CFA PREP/_port_repo/studyhub/cfa-l2.html" \
  --ftp-ssl --insecure --ftp-pasv \
  -u "$FTP_USER:$FTP_PASS" \
  "ftp://$FTP_HOST/domains/amiteshray.com/public_html/studyhub/cfa-l2.html" \
  -w "HTML: %{http_code}\n" -o /dev/null
```
Status 226 = success. Verify live: `curl -I "https://amiteshray.com/studyhub/assets/notes/${PREFIX}-01.jpg"`

### Step 7: Git commit + push (SECONDARY — via osascript)
```applescript
do shell script "rm -f '/Users/amiteshray/Documents/Claude/Projects/CFA PREP/_port_repo/.git/index.lock' '/Users/amiteshray/Documents/Claude/Projects/CFA PREP/_port_repo/.git/HEAD.lock' 2>/dev/null; echo done"

do shell script "cd '/Users/amiteshray/Documents/Claude/Projects/CFA PREP/_port_repo' && git add studyhub/ && git pull --rebase origin main 2>&1 && git commit -m 'feat(studyhub): add <Subject> notes + scanned pages + downloads card' 2>&1 && git push origin main 2>&1"
```

---

## Workflow B — New Note Images (JPG/PNG direct upload)

1. Copy to `_port_repo/studyhub/assets/notes/<prefix>-<nn>.jpg`
2. Add entry to `PAGE_IMAGES`: `"<prefix>-<nn>": "./assets/notes/<prefix>-<nn>.jpg"`
3. Update relevant `INDEX` entry `pages:[]`
4. Run Step 5 (validate), Step 6 (FTPS), Step 7 (git)

---

## Workflow C — New Explainer (HTML or JSON)

### Step 1: Append to seed_explainers.js
```javascript
{
  "id": "unique_id",
  "title": "Explainer Title",
  "topic": "eco",   // MUST be one of the supported topic keys — see list at top
  "type": "html",
  "data": "ESCAPED_HTML_NO_RAW_NEWLINES",
  "seed": true,
  "uploaded": "2026-01-01T00:00:00.000Z"
}
```

> **CRITICAL**: Escape ALL newlines before inserting into `data`:
> ```js
> content.replace(/\n/g, "\\n").replace(/\r/g, "\\r")
> ```
> A single raw newline = `SyntaxError: Invalid or unexpected token` = entire Study Hub breaks.

### Step 2: Check topic key is in topicNames map

Open `cfa-l2.html` and search for `const topicNames`. If the explainer's `topic` value is NOT already a key in that object, add it:
```js
newTopicKey: '🏷️ Display Label',
```
Supported keys as of last update: `equity`, `fi`, `deriv`, `derivatives`, `econ`, `eco`, `economics`, `fsa`, `fra`, `corp`, `corporate`, `alt`, `alts`, `alternatives`, `pm`, `ethics`, `quant`, `quantitative`, `other`.

### Step 3: Validate, cache-bust, deploy
1. `node --check _port_repo/studyhub/assets/seed_explainers.js` — fix any errors first
2. Bump cache-bust in `cfa-l2.html`: `seed_explainers.js?v=X` → `?v=X+1`
3. FTPS deploy `seed_explainers.js` + `cfa-l2.html`
4. Git commit + push via osascript

> **No manual Downloads HTML needed** — explainers auto-appear in the Downloads tab via `initDownloadsView()`, grouped by topic with individual ⬇ download buttons.

---

## Final Verification Checklist

- [ ] JS syntax valid (`new Function(script)` throws no errors)
- [ ] `PAGE_IMAGES` has entries for every new JPG
- [ ] All `INDEX` `pages:[]` arrays populated for this subject
- [ ] New PDF download card added to `#v-downloads` HTML (for PDF notes)
- [ ] All new JPGs return 226 on FTPS upload
- [ ] PDF uploaded via FTPS (226)
- [ ] `cfa-l2.html` returns 226 on FTPS upload
- [ ] `seed_explainers.js` returns 226 on FTPS upload (for explainers)
- [ ] Explainer topic key exists in `topicNames` map (for explainers)
- [ ] `curl -I "https://amiteshray.com/studyhub/assets/notes/<prefix>-01.jpg"` → 200
- [ ] Git committed and pushed to main

## Notify User
> ✅ **X JPG pages** live at https://amiteshray.com/studyhub/cfa-l2.html
> Cards for [Subject] now show scanned note pages. Downloads section updated. Git repo synced.
> Hit **Shift+Reload** to clear browser cache.

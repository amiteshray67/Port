---
name: StudyHubUpdater
description: Universal updater for the CFA Study Hub. Use this skill when the user drops in new notes (JPG/PNG/PDF) or new explainers (JSON/HTML). It automates adding them to the port repo, updating linkages in `cfa-l2.html` and `seed_explainers.js`, and deploying to GitHub Pages.
---

# StudyHubUpdater

This skill automates the process of adding new content (notes or explainers) to the CFA L2 Study Hub on `amiteshray.com/studyhub`. 

When the user uploads a new note or explainer and invokes this skill, follow these exact steps to ensure 100% functionality.

## Core Architecture Context
- **Study Hub Root**: `_port_repo/studyhub/`
- **Notes Path**: `_port_repo/studyhub/assets/notes/` (Images and PDFs)
- **Explainers Data Path**: `_port_repo/studyhub/assets/seed_explainers.js`
- **Main App UI**: `_port_repo/studyhub/cfa-l2.html`

## Workflow: For New Notes (Images or PDFs)

1. **Move the file** to the correct location:
   - Copy the uploaded file to `_port_repo/studyhub/assets/notes/<filename>`.
2. **Update linkages in `cfa-l2.html`**:
   - If it's a **Note Image** (e.g., `derivatives-01.jpg`): Search for `const NOTES_INDEX` in `cfa-l2.html` and increment the `count` for the relevant topic, or add the topic if it doesn't exist.
   - If it's a **PDF Document** (e.g., `Derivatives_Notes.pdf`): Locate the `<!-- Downloads View -->` in `cfa-l2.html`. Add an `<a href="./assets/notes/<filename>" download>` link in the Handwritten Notes section.

## Workflow: For New Explainers (JSON or HTML)

1. **Process the Explainer Content**:
   - Extract the core HTML or JSON content of the new explainer.
2. **Update `seed_explainers.js`**:
   - The file contains a global array: `var SEED_EXPLAINERS = [...];`
   - You must append a new object to this array:
     ```javascript
     {
       "id": "unique_id_for_explainer",
       "title": "Explainer Title",
       "topic": "topic_id", // Optional, matches notes topics (e.g., 'equity', 'fi', 'derivatives')
       "type": "html",      // or "image", "json"
       "data": "escaped_html_string",
       "seed": true,
       "uploaded": "2025-01-01T00:00:00.000Z"
     }
     ```
   - **CRITICAL FORMATTING RULE**: You **MUST** escape all literal newline characters (`\n`) and carriage returns (`\r`) in the `data` string as `\\n` and `\\r` before inserting it into the JS array. If you insert a raw `0x0A` byte into the string, it will cause a `SyntaxError: Invalid or unexpected token` and break the entire Study Hub.

## Final Steps (Always Perform)

1. **Verify Integrity**:
   - Run `node -c _port_repo/studyhub/assets/seed_explainers.js` to ensure there are no syntax errors introduced by unescaped newlines.
2. **Cache Bust**:
   - In `_port_repo/studyhub/cfa-l2.html`, locate `<script src="./assets/seed_explainers.js?v=X"></script>`. Increment the `v=` parameter number (e.g. `?v=3` to `?v=4`) to bust the GitHub Pages edge cache.
3. **Commit and Push**:
   ```bash
   cd _port_repo
   git add -A
   git commit -m "feat(studyhub): add new content and update linkages"
   git push origin main
   ```
4. **Notify User**:
   - Confirm the deployment and provide the link: `https://amiteshray.com/studyhub/cfa-l2.html`. Remind them it takes 1-2 minutes for GitHub Pages to reflect changes.

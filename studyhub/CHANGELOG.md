# Study Hub Architecture & Changelog

## Objective
This repository (`_port_repo/studyhub`) hosts the user's interactive study materials, primarily the CFA Level 2 Study Hub. The goal of this architecture is to be **easily scalable and LLM-manageable**. When new notes or explainers are provided, an LLM (using the `StudyHubUpdater` skill) can automatically ingest the files, update the linkages, and push the live site to GitHub Pages.

## Core Components
- **`index.html` (Study Hub Home)**: Displays available courses in a card grid.
- **`cfa-l2.html` (CFA Hub)**: The main single-page application for the CFA course. It contains the UI shell, dashboard, notes navigator, and explainer navigator.
- **`assets/notes/`**: All raw note material. Either individual page images (like `equity-01.jpg`) or full PDF downloads (`Equity_notes.pdf`, `Final_Copy_FI_L2.pdf`).
- **`assets/seed_explainers.js`**: Contains the `SEED_EXPLAINERS` JavaScript array, which loads the base-64 encoded "seed" explainers natively into `cfa-l2.html` before any user uploads.

## How to Add New Materials

### 1. Adding New Explainer JSON or HTML
1. Open `seed_explainers.js`.
2. Push the new explainer object (with `id`, `title`, `topic`, `type`, `data`) into the `SEED_EXPLAINERS` array.
3. **CRITICAL JSON SYNTAX RULE**: You **MUST** escape all raw newlines (`\n`) and carriage returns (`\r`) in the stringified `data` before appending it to the file. For example, `html_string.replace(/\n/g, '\\n')`. A raw `0x0A` byte inside a string will cause a `SyntaxError: Invalid or unexpected token` and break the entire study hub.

### 2. Adding New Notes (Images)
1. Drop the new JPG/PNG images into `assets/notes/` (e.g. `derivatives-01.jpg`).
2. Update the `NOTES_INDEX` constant in `cfa-l2.html` to include the new topic or update the `count` attribute of the existing topic.
3. Verify the PDF download link in the "Downloads" view of `cfa-l2.html` points to the corresponding PDF file.

### 3. Adding New Notes (PDF Downloads)
1. Place the new PDF in `assets/notes/`.
2. Locate the `<!-- Downloads View -->` in `cfa-l2.html` and add a new resource card with an `<a href="./assets/notes/YourFile.pdf" download="YourFile.pdf">` tag matching the existing UI pattern.

## Changelog
- **v2.1**: Removed JS-based ZIP downloads for images. Replaced with direct PDF downloads for continuous documents.
- **v2.0**: Migrated to GitHub Pages portfolio. Extracted 61 images to `assets/notes/` and base-64 explainers to `seed_explainers.js` to bypass HTML file size limits. Removed Mock Simulator and Formula Hub UI.

## Required Skill
Use the **StudyHubUpdater** Claude Skill to handle these operations automatically via chat.

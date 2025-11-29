# Portfolio Sync Workflow

This document explains how to keep your portfolio website synchronized with your LinkedIn profile.

## Overview

Your portfolio website is now **data-driven**. This means the content (Experience, Education, Certifications, About) is stored in `js/profile-data.js` instead of being hardcoded in HTML.

To update your website, you can either:
1.  **Manually edit** `js/profile-data.js` (easy and safe).
2.  **Auto-sync** using your LinkedIn profile page (fast).

## Auto-Sync Workflow

Since LinkedIn restricts automated access to their API, we use a safe "local file" approach.

### Prerequisites
- You need **Node.js** installed on your computer.
- Run `npm install` in this directory once to install dependencies.

### Steps to Sync

1.  **Go to your LinkedIn Profile**
    Open your profile page (e.g., `linkedin.com/in/yourname`) in your browser.

2.  **Save the Page**
    - Right-click anywhere on the page.
    - Select **"Save As..."** (or "Save Page As...").
    - Save the file as `linkedin_profile.html` in the **root folder** of this project (same folder as `index.html`).
    - *Note: Ensure you save as "Webpage, Complete" or "HTML Only".*

3.  **Run the Sync Script**
    Open your terminal in the project folder and run:
    ```bash
    npm run sync
    ```

4.  **Verify**
    The script will parse the HTML file and update `js/profile-data.js`.
    Open `index.html` in your browser to see the changes!

## Manual Update

If the sync script misses something (LinkedIn changes their layout often), you can simply open `js/profile-data.js` in any text editor and update the text there. It's much cleaner than editing HTML!

# LinkedIn API Sync Instructions

This method uses your LinkedIn session cookie to fetch your complete profile data directly from LinkedIn's API. This is more robust than saving the HTML file because it gets all the data (Experience, Education, etc.) regardless of whether it was loaded on the screen.

## Prerequisites

1.  **Node.js** installed (you already have this).
2.  **Chrome/Edge/Firefox** browser logged into LinkedIn.

## Setup

1.  **Create a `.env` file**:
    *   Copy the `.env.example` file to a new file named `.env`:
        ```bash
        cp .env.example .env
        ```
    *   (Or just create a new file named `.env` in the root folder).

2.  **Get your `li_at` Cookie**:
    *   Open your browser and go to [www.linkedin.com](https://www.linkedin.com).
    *   Open **Developer Tools** (Right-click anywhere -> Inspect, or F12).
    *   Go to the **Application** tab (Chrome/Edge) or **Storage** tab (Firefox).
    *   In the sidebar, expand **Cookies** and click on `https://www.linkedin.com`.
    *   Find the cookie named `li_at`.
    *   Copy its **Value**.
    *   Paste it into your `.env` file:
        ```
        LINKEDIN_LI_AT_COOKIE="your_copied_value_here"
        ```
        *(Make sure to keep the quotes if the value has special characters, though usually not strictly necessary for simple env parsers, but good practice).*

## Usage

1.  **Run the Sync**:
    ```bash
    npm run sync-api
    ```

This command will:
1.  Fetch your profile data from LinkedIn.
2.  Save it to `linkedin_data.json` (for reference/backup).
3.  Update `js/profile-data.js` with the latest info.

## Troubleshooting

*   **401 Unauthorized**: Your cookie might have expired or is incorrect. Refresh the LinkedIn page, get a new `li_at` cookie, and update `.env`.
*   **CSRF Error**: The script handles CSRF tokens automatically, but if it fails, try getting a fresh cookie.

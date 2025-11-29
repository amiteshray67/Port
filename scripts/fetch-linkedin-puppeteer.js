const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const ENV_PATH = path.join(__dirname, '../.env');
const PROFILE_DATA_PATH = path.join(__dirname, '../js/profile-data.js');
const OUTPUT_JSON_PATH = path.join(__dirname, '../linkedin_data.json');

// Configuration
const MY_PROFILE_URN = 'urn:li:member:765616959'; // From previous debug
const DECORATION_ID = 'com.linkedin.voyager.dash.deco.identity.profile.FullProfileWithEntities-85';

function loadEnv() {
    if (!fs.existsSync(ENV_PATH)) {
        console.error("Error: .env file not found.");
        process.exit(1);
    }
    const content = fs.readFileSync(ENV_PATH, 'utf8');
    const match = content.match(/LINKEDIN_LI_AT_COOKIE=["']?([^"'\n]+)["']?/);
    if (!match) {
        console.error("Error: LINKEDIN_LI_AT_COOKIE not found in .env file.");
        process.exit(1);
    }
    return match[1].trim();
}

async function main() {
    const cookieValue = loadEnv();

    console.log("Launching Google Chrome...");
    const browser = await puppeteer.launch({
        headless: false, // Show the browser
        defaultViewport: null, // Use full window size
        args: ['--start-maximized'], // Start maximized
        ignoreHTTPSErrors: true,
        executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' // macOS default
    });

    try {
        const page = await browser.newPage();

        // Don't set cookie manually, let user login.
        // This avoids the redirect loop if the cookie is bad.

        console.log("Navigating to LinkedIn Login...");
        await page.goto('https://www.linkedin.com/login', { waitUntil: 'domcontentloaded' });

        // Check if we are actually logged in
        const isLoggedIn = await page.evaluate(() => !!document.querySelector('.global-nav__me-photo') || !!document.querySelector('#global-nav'));

        if (!isLoggedIn) {
            console.log("⚠️  Not logged in automatically. Please log in manually in the browser window!");
            console.log("Waiting for you to log in...");

            // Wait for either the URL to contain 'feed' OR the nav element to appear
            await Promise.race([
                page.waitForSelector('.global-nav__me-photo', { timeout: 0 }),
                page.waitForSelector('#global-nav', { timeout: 0 }),
                page.waitForFunction(() => window.location.href.includes('/feed/'), { timeout: 0 })
            ]);

            console.log("Login detected! Waiting a moment for page to settle...");
            await new Promise(r => setTimeout(r, 5000)); // Wait 5s for things to load
        }

        // 2. Execute Fetch in browser context
        console.log("Fetching profile data via browser context...");

        // We need to get the CSRF token from cookies inside the browser
        const profileData = await page.evaluate(async (urn, decorationId) => {
            function getCookie(name) {
                const value = `; ${document.cookie}`;
                const parts = value.split(`; ${name}=`);
                if (parts.length === 2) return parts.pop().split(';').shift();
            }

            const csrfToken = getCookie('JSESSIONID').replace(/"/g, '');

            if (!csrfToken) {
                return { error: "Could not find JSESSIONID cookie" };
            }

            const query = `q=memberIdentity&memberIdentity=${encodeURIComponent(urn)}&decorationId=${encodeURIComponent(decorationId)}`;
            const url = `https://www.linkedin.com/voyager/api/identity/dash/profiles?${query}`;

            try {
                const response = await fetch(url, {
                    method: 'GET',
                    headers: {
                        'csrf-token': csrfToken,
                        'x-restli-protocol-version': '2.0.0',
                        'accept': 'application/vnd.linkedin.normalized+json+2.1'
                    }
                });

                if (!response.ok) {
                    return { error: `API Error: ${response.status} ${response.statusText}` };
                }

                return await response.json();
            } catch (e) {
                return { error: e.message };
            }
        }, MY_PROFILE_URN, DECORATION_ID);

        if (profileData.error) {
            throw new Error(profileData.error);
        }

        console.log("Successfully fetched profile data!");

        // Save raw data
        fs.writeFileSync(OUTPUT_JSON_PATH, JSON.stringify(profileData, null, 2));
        console.log(`Saved raw data to ${OUTPUT_JSON_PATH}`);

        // Transform and Update
        const transformedData = transformData(profileData);
        updateProfileData(transformedData);

    } catch (e) {
        console.error("Error:", e.message);
    } finally {
        await browser.close();
    }
}

function transformData(apiData) {
    const portfolioData = {
        hero: {},
        about: {},
        experience: [],
        education: [],
        certifications: [],
        contact: {}
    };

    if (!apiData || !apiData.elements || apiData.elements.length === 0) {
        console.error("No profile data found in API response.");
        return portfolioData;
    }

    const profile = apiData.elements[0];

    // 1. Hero
    portfolioData.hero = {
        name: `${profile.firstName} ${profile.lastName}`,
        title: profile.headline || "Professional",
        heading: `Let's Unravel <span>Finance</span> Together`,
        subheading: profile.headline,
        location: profile.locationName,
        image: "assets/images/profile-placeholder.jpg"
    };

    // 2. About
    portfolioData.about = {
        title: "About Me",
        description: (profile.summary || "").replace(/\n/g, '<br>')
    };

    // 3. Experience
    if (profile.profilePositionGroups && profile.profilePositionGroups.elements) {
        profile.profilePositionGroups.elements.forEach(group => {
            if (group.profilePositionInGroup && group.profilePositionInGroup.elements) {
                group.profilePositionInGroup.elements.forEach(pos => {
                    portfolioData.experience.push({
                        title: pos.title,
                        company: pos.companyName,
                        period: formatPeriod(pos.dateRange),
                        description: (pos.description || "").replace(/\n/g, '<br>')
                    });
                });
            }
        });
    }

    // 4. Education
    if (profile.profileEducations && profile.profileEducations.elements) {
        profile.profileEducations.elements.forEach(edu => {
            portfolioData.education.push({
                school: edu.schoolName,
                degree: edu.degreeName,
                field: edu.fieldOfStudy,
                period: formatPeriod(edu.dateRange),
                description: (edu.description || "").replace(/\n/g, '<br>')
            });
        });
    }

    // 5. Certifications
    if (profile.profileCertifications && profile.profileCertifications.elements) {
        profile.profileCertifications.elements.forEach(cert => {
            portfolioData.certifications.push({
                name: cert.name,
                issuer: cert.authority,
                date: formatPeriod(cert.dateRange, true),
                link: cert.url || "#"
            });
        });
    }

    // 6. Contact
    portfolioData.contact = {
        email: "amitesh.ray@example.com",
        linkedin: "https://www.linkedin.com/in/amitesh-ray",
        github: "https://github.com/amiteshray"
    };

    return portfolioData;
}

function formatPeriod(dateRange, singleDate = false) {
    if (!dateRange) return "";

    const formatDate = (date) => {
        if (!date) return "Present";
        const year = date.year;
        const month = date.month ? new Date(0, date.month - 1).toLocaleString('default', { month: 'short' }) : "";
        return month ? `${month} ${year}` : `${year}`;
    };

    const start = formatDate(dateRange.start);
    const end = formatDate(dateRange.end);

    if (singleDate) return start;
    if (!dateRange.start) return "";

    return `${start} - ${end}`;
}

function updateProfileData(newData) {
    let existingData = {};
    if (fs.existsSync(PROFILE_DATA_PATH)) {
        const content = fs.readFileSync(PROFILE_DATA_PATH, 'utf8');
        try {
            const jsonStr = content.substring(content.indexOf('{'), content.lastIndexOf('}') + 1);
            existingData = eval('(' + jsonStr + ')');
        } catch (e) { }
    }

    const mergedData = {
        ...existingData,
        ...newData,
        hero: { ...existingData.hero, ...newData.hero },
        contact: { ...existingData.contact, ...newData.contact }
    };

    const newFileContent = `const portfolioData = ${JSON.stringify(mergedData, null, 4)};`;
    fs.writeFileSync(PROFILE_DATA_PATH, newFileContent);
    console.log(`Successfully updated ${PROFILE_DATA_PATH}`);
}

main();

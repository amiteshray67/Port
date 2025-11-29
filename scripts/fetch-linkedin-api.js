const https = require('https');
const fs = require('fs');
const path = require('path');

// Load env variables manually to avoid adding 'dotenv' dependency if possible, 
// but for robustness we'll just read the file.
const ENV_PATH = path.join(__dirname, '../.env');
const OUTPUT_JSON_PATH = path.join(__dirname, '../linkedin_data.json');
const PROFILE_DATA_PATH = path.join(__dirname, '../js/profile-data.js');

// Configuration
const MY_PROFILE_URN = 'urn:li:member:765616959'; // Extracted from your previous HTML
// This decoration ID requests full profile details including entities
const DECORATION_ID = 'com.linkedin.voyager.dash.deco.identity.profile.FullProfileWithEntities-85';

function loadEnv() {
    if (!fs.existsSync(ENV_PATH)) {
        console.error("Error: .env file not found. Please create one based on .env.example.");
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

function fetchWithRetry(path, cookie) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'www.linkedin.com',
            path: path,
            method: 'GET',
            headers: {
                'Cookie': `li_at=${cookie}; JSESSIONID="ajax:1234"`,
                'Csrf-Token': 'ajax:1234',
                'X-Restli-Protocol-Version': '2.0.0',
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'application/vnd.linkedin.normalized+json+2.1',
                'x-li-lang': 'en_US'
            }
        };

        console.log(`Fetching ${path}...`);
        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    try {
                        const json = JSON.parse(data);
                        resolve(json);
                    } catch (e) {
                        reject(new Error("Failed to parse API response: " + e.message));
                    }
                } else {
                    reject(new Error(`API Request to ${path} failed with status ${res.statusCode}: ${data.substring(0, 200)}`));
                }
            });
        });

        req.on('error', (e) => reject(e));
        req.end();
    });
}

async function fetchProfileData(cookie) {
    // 1. Fetch 'Me' to get the correct URN and verify auth
    try {
        const meData = await fetchWithRetry('/voyager/api/me', cookie);
        console.log("Successfully authenticated as:", meData.miniProfile.firstName, meData.miniProfile.lastName);

        const entityUrn = meData.miniProfile.entityUrn; // e.g., urn:li:fs_miniProfile:ACoAAC...
        // Extract the ID part
        const parts = entityUrn.split(':');
        const memberId = parts[parts.length - 1];

        // Use the dash profile endpoint which is more detailed
        const profileUrn = `urn:li:fsd_profile:${memberId}`;
        const query = `q=memberIdentity&memberIdentity=${encodeURIComponent(profileUrn)}&decorationId=${encodeURIComponent(DECORATION_ID)}`;

        return await fetchWithRetry(`/voyager/api/identity/dash/profiles?${query}`, cookie);

    } catch (e) {
        console.error("Auth check failed:", e.message);
        // Fallback to the hardcoded URN if 'me' fails but maybe the other endpoint works?
        // Unlikely if auth is the issue.
        throw e;
    }
}

function transformData(apiData) {
    // Basic structure based on profile-data.js
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
        heading: `Let's Unravel <span>Finance</span> Together`, // Keep branding
        subheading: profile.headline,
        location: profile.locationName,
        image: "assets/images/profile-placeholder.jpg" // We can't easily get the high-res URL without more complex parsing, sticking to placeholder or existing
    };

    // 2. About
    portfolioData.about = {
        title: "About Me",
        description: profile.summary || ""
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
                        description: pos.description || ""
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
                description: edu.description || "" // Activities/Societies often here
            });
        });
    }

    // 5. Certifications
    if (profile.profileCertifications && profile.profileCertifications.elements) {
        profile.profileCertifications.elements.forEach(cert => {
            portfolioData.certifications.push({
                name: cert.name,
                issuer: cert.authority,
                date: formatPeriod(cert.dateRange, true), // Just year or "Issued..."
                link: cert.url || "#"
            });
        });
    }

    // 6. Contact (Keep existing or default)
    portfolioData.contact = {
        email: "amitesh.ray@example.com", // API doesn't usually give email
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

async function main() {
    try {
        const cookie = loadEnv();
        const apiData = await fetchProfileData(cookie);

        // Save raw data for debugging
        fs.writeFileSync(OUTPUT_JSON_PATH, JSON.stringify(apiData, null, 2));
        console.log(`Raw API data saved to ${OUTPUT_JSON_PATH}`);

        const portfolioData = transformData(apiData);

        // Read existing to preserve some fields if needed (like custom branding)
        let existingData = {};
        if (fs.existsSync(PROFILE_DATA_PATH)) {
            const content = fs.readFileSync(PROFILE_DATA_PATH, 'utf8');
            try {
                const jsonStr = content.substring(content.indexOf('{'), content.lastIndexOf('}') + 1);
                existingData = eval('(' + jsonStr + ')');
            } catch (e) { }
        }

        // Merge carefully: we want API data to override content, but maybe keep styling/branding
        // For now, let's just update the content fields.
        const mergedData = {
            ...existingData,
            ...portfolioData,
            hero: { ...existingData.hero, ...portfolioData.hero },
            contact: { ...existingData.contact, ...portfolioData.contact } // Keep manual contact info
        };

        const newFileContent = `const portfolioData = ${JSON.stringify(mergedData, null, 4)};`;
        fs.writeFileSync(PROFILE_DATA_PATH, newFileContent);
        console.log(`Successfully updated ${PROFILE_DATA_PATH}`);

    } catch (error) {
        console.error("Sync failed:", error.message);
    }
}

main();

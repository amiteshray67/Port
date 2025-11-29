const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

const PROFILE_DATA_PATH = path.join(__dirname, '../js/profile-data.js');
const LINKEDIN_HTML_PATH = path.join(__dirname, '../linkedin_profile.html');

function parseLinkedInProfile(html) {
    const $ = cheerio.load(html);
    const data = {};

    // Helper to find section by header text
    const findSection = (headerText) => {
        return $('section').filter((i, el) => {
            return $(el).find('h2, h3, span').text().includes(headerText);
        }).first();
    };

    // 1. Hero / Intro
    const name = $('h1').first().text().trim();
    const headline = $('.text-body-medium').first().text().trim() || $('div[data-generated-suggestion-target]').first().text().trim();

    if (name) {
        data.hero = {
            name: name,
            title: "Finance Professional", // Default or extract
            heading: `Let's Unravel <span>Finance</span> Together`, // Keep existing branding
            subheading: headline
        };
    }

    // 2. About
    const aboutSection = $('#about').parent(); // Usually id="about" is on an anchor or div
    // Fallback: look for "About" text
    let aboutText = "";
    const aboutHeader = $('h2').filter((i, el) => $(el).text().trim() === 'About');
    if (aboutHeader.length) {
        // The text is usually in a div following the header or in a specific class
        const container = aboutHeader.closest('section').find('.inline-show-more-text, .pv-shared-text-with-see-more');
        aboutText = container.text().trim();
    }

    if (aboutText) {
        data.about = {
            paragraphs: aboutText.split('\n').map(p => p.trim()).filter(p => p.length > 0)
        };
    }

    // 3. Experience
    const experienceSection = $('#experience').closest('section');
    if (experienceSection.length) {
        const experiences = [];
        experienceSection.find('li').each((i, el) => {
            const role = $(el).find('.t-bold span').first().text().trim();
            const company = $(el).find('.t-normal span').first().text().trim();
            const dateRange = $(el).find('.t-black--light span').first().text().trim();
            const description = $(el).find('.inline-show-more-text').text().trim();

            if (role && company) {
                experiences.push({
                    role,
                    company,
                    date: dateRange,
                    description
                });
            }
        });
        if (experiences.length > 0) {
            data.experience = experiences;
        }
    }

    // 4. Education
    const educationSection = $('#education').closest('section');
    if (educationSection.length) {
        const education = [];
        educationSection.find('li').each((i, el) => {
            const school = $(el).find('.t-bold span').first().text().trim();
            const degree = $(el).find('.t-normal span').first().text().trim();
            const dates = $(el).find('.t-black--light span').first().text().trim();

            if (school) {
                education.push({
                    degree: degree,
                    institution: school,
                    date: dates,
                    details: "" // LinkedIn often hides grades deep in structure
                });
            }
        });
        if (education.length > 0) {
            data.education = education;
        }
    }

    // 5. Certifications
    const certSection = $('#licenses_and_certifications').closest('section');
    if (certSection.length) {
        const certs = [];
        certSection.find('li').each((i, el) => {
            const title = $(el).find('.t-bold span').first().text().trim();
            const issuer = $(el).find('.t-normal span').first().text().trim();
            const date = $(el).find('.t-black--light span').first().text().trim();

            if (title) {
                certs.push({
                    title,
                    issuer,
                    date,
                    description: "",
                    icon: "fas fa-award"
                });
            }
        });
        if (certs.length > 0) {
            data.certifications = certs;
        }
    }

    return data;
}

async function main() {
    if (!fs.existsSync(LINKEDIN_HTML_PATH)) {
        console.error(`Error: Could not find ${LINKEDIN_HTML_PATH}`);
        console.log("Please save your LinkedIn profile page as 'linkedin_profile.html' in the root directory.");
        console.log("Instructions: Go to your LinkedIn profile -> Right Click -> Save As -> 'Webpage, Complete' or 'HTML Only'");
        process.exit(1);
    }

    console.log("Reading LinkedIn HTML file...");
    const html = fs.readFileSync(LINKEDIN_HTML_PATH, 'utf8');

    console.log("Parsing profile data...");
    const newData = parseLinkedInProfile(html);

    console.log("Reading existing profile data...");
    let currentFileContent = fs.readFileSync(PROFILE_DATA_PATH, 'utf8');

    // Extract the object part
    const startMatch = currentFileContent.indexOf('{');
    const endMatch = currentFileContent.lastIndexOf('}');

    if (startMatch === -1 || endMatch === -1) {
        console.error("Error: Could not parse existing profile-data.js");
        process.exit(1);
    }

    // We need to be careful not to overwrite everything if parsing failed for some sections
    // So we'll merge the new data into the old data structure
    // Since we can't easily `require` the file because it's a client-side script (might not be valid Node module),
    // we will use a regex or simple evaluation if safe.
    // Actually, since we wrote it, we know it's `const portfolioData = { ... };`

    // Let's just evaluate it in a sandbox or use a simple replace approach.
    // Safer: Read it as text, parse JSON if possible, but it's JS object literal.
    // We'll just construct a new file content.

    // For now, let's assume we want to overwrite the sections we found.

    // We can try to `eval` the content to get the object (safe enough for local tool).
    let portfolioData;
    try {
        // Remove "const portfolioData = " and ";"
        const objStr = currentFileContent.substring(startMatch, endMatch + 1);
        // Use eval to parse the object literal
        portfolioData = eval('(' + objStr + ')');
    } catch (e) {
        console.error("Warning: Could not load existing data, starting with empty object.", e);
        portfolioData = {};
    }

    // Merge
    if (newData.hero) {
        portfolioData.hero = { ...portfolioData.hero, ...newData.hero };
        console.log("Updated Hero section");
    }
    if (newData.about) {
        portfolioData.about = newData.about;
        console.log("Updated About section");
    }
    if (newData.experience) {
        portfolioData.experience = newData.experience;
        console.log(`Updated Experience section (${newData.experience.length} items)`);
    }
    if (newData.education) {
        portfolioData.education = newData.education;
        console.log(`Updated Education section (${newData.education.length} items)`);
    }
    if (newData.certifications) {
        portfolioData.certifications = newData.certifications;
        console.log(`Updated Certifications section (${newData.certifications.length} items)`);
    }

    // Write back
    const newFileContent = `const portfolioData = ${JSON.stringify(portfolioData, null, 4)};`;
    fs.writeFileSync(PROFILE_DATA_PATH, newFileContent);

    console.log(`Successfully updated ${PROFILE_DATA_PATH}`);
}

main();

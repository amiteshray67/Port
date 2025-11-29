const fs = require('fs');
const cheerio = require('cheerio');
const path = require('path');

const LINKEDIN_HTML_PATH = path.join(__dirname, '../linkedin_profile.html');

function main() {
    if (!fs.existsSync(LINKEDIN_HTML_PATH)) {
        console.error("File not found:", LINKEDIN_HTML_PATH);
        return;
    }

    const html = fs.readFileSync(LINKEDIN_HTML_PATH, 'utf8');
    const $ = cheerio.load(html);
    const codeTags = $('code');

    console.log(`Found ${codeTags.length} code tags.`);

    const allData = [];

    codeTags.each((i, el) => {
        const id = $(el).attr('id');
        const content = $(el).html().trim();

        if (content.startsWith('{') || content.startsWith('[')) {
            try {
                // Decode HTML entities if necessary (cheerio .html() might encode them)
                // But usually .text() is better for content, let's try .html() first as it's raw
                // Actually, .text() on a code tag might be safer if it contains JSON.
                // Let's use .text() to avoid entity issues.
                const rawJson = $(el).text().trim();
                if (!rawJson) return;

                const json = JSON.parse(rawJson);
                allData.push({ id, json });
            } catch (e) {
                // console.error(`Failed to parse JSON in tag ${id}:`, e.message);
            }
        }
    });

    console.log(`Successfully parsed ${allData.length} JSON blobs.`);

    // Analyze types and find specific content
    const allTypes = new Set();
    const searchString = "Arcesium";

    allData.forEach((item, idx) => {
        const traverse = (obj, path = '') => {
            if (!obj || typeof obj !== 'object') {
                if (typeof obj === 'string' && obj.includes(searchString)) {
                    console.log(`Found '${searchString}' in [${idx}] at path: ${path}`);
                    console.log(`  Value: ${obj}`);
                    // Print the parent object to see context
                    // console.log(`  Parent:`, JSON.stringify(obj, null, 2)); 
                }
                return;
            }

            if (obj['$type']) {
                allTypes.add(obj['$type']);
            }

            Object.entries(obj).forEach(([key, val]) => {
                if (Array.isArray(val)) {
                    val.forEach((v, i) => traverse(v, `${path}.${key}[${i}]`));
                } else {
                    traverse(val, `${path}.${key}`);
                }
            });
        };

        traverse(item.json);
    });

    console.log("\n--- All Types Found ---");
    Array.from(allTypes).sort().forEach(t => console.log(t));
}

main();

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Amitesh Ray Portfolio - README</title>
    <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.0.0/css/all.min.css" rel="stylesheet">
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 900px;
            margin: 0 auto;
            padding: 20px;
        }
        pre {
            background-color: #f6f8fa;
            border-radius: 6px;
            padding: 16px;
            overflow-x: auto;
        }
        code {
            font-family: SFMono-Regular, Consolas, 'Liberation Mono', Menlo, monospace;
            font-size: 85%;
        }
        h1, h2, h3 {
            margin-top: 24px;
            margin-bottom: 16px;
            font-weight: 600;
            line-height: 1.25;
        }
        h1 {
            font-size: 2em;
            border-bottom: 1px solid #eaecef;
            padding-bottom: .3em;
        }
        h2 {
            font-size: 1.5em;
            border-bottom: 1px solid #eaecef;
            padding-bottom: .3em;
        }
        h3 {
            font-size: 1.25em;
        }
        ul, ol {
            padding-left: 2em;
        }
        img {
            max-width: 100%;
        }
        .file-tree {
            font-family: monospace;
            margin: 0;
            padding: 0;
            list-style: none;
        }
        .file-tree li {
            margin: 0;
            padding: 0 0 0 2em;
            position: relative;
        }
        .file-tree li::before {
            content: "├── ";
            position: absolute;
            left: 0;
        }
        .file-tree li:last-child::before {
            content: "└── ";
        }
        .root::before {
            content: "";
        }
        .code-block {
            background-color: #f6f8fa;
            border-radius: 6px;
            padding: 16px;
            margin-bottom: 16px;
        }
        .wp-code {
            font-family: monospace;
            color: #24292e;
        }
    </style>
</head>
<body>

<h1>
    <i class="fas fa-user-tie text-indigo-600 mr-2"></i>
    Amitesh Ray Portfolio - GitHub Repository
</h1>

<p>This repository contains the complete codebase for Amitesh Ray's personal portfolio website with interactive financial calculators, dark mode support, and responsive design.</p>

<h2>
    <i class="fas fa-folder-open text-indigo-600 mr-2"></i>
    Repository Structure
</h2>

<pre class="file-tree">
<span class="root">amiteshray.github.io/</span>    # Root repository folder
├── index.html           # Main HTML file
├── css/                 # CSS directory
│   ├── styles.css       # Main stylesheet
│   └── normalize.css    # CSS reset
├── js/                  # JavaScript directory
│   ├── main.js          # Main JavaScript functionality
│   ├── calculators.js   # Calculator-specific JavaScript
│   └── charts.js        # Chart rendering code
├── assets/              # Assets directory
│   ├── images/          # Images subdirectory
│   │   ├── profile.jpg  # Your profile picture
│   │   └── favicon.ico  # Website favicon
│   └── fonts/           # Font files (if not using CDN)
├── .gitignore           # Git ignore file
├── LICENSE              # License file
└── README.md            # This repository documentation
</pre>

<h2>
    <i class="fas fa-laptop-code text-indigo-600 mr-2"></i>
    Setup Instructions
</h2>

<h3>Local Development Setup</h3>

<ol>
    <li>Clone this repository to your local machine:
        <div class="code-block">
            <code>git clone https://github.com/amiteshray/amiteshray.github.io.git</code>
        </div>
    </li>
    <li>Navigate to the project directory:
        <div class="code-block">
            <code>cd amiteshray.github.io</code>
        </div>
    </li>
    <li>Open index.html in your browser to view the site locally.</li>
    <li>For active development, you can use a local server like Live Server extension in VS Code or http-server.</li>
</ol>

<h3>Dependencies</h3>

<p>This project uses the following external dependencies:</p>

<ul>
    <li>Chart.js - For financial calculator visualizations</li>
    <li>Font Awesome - For icons (via jsDelivr CDN)</li>
    <li>Google Fonts - For typography</li>
</ul>

<h2>
    <i class="fas fa-rocket text-indigo-600 mr-2"></i>
    Deployment Instructions
</h2>

<h3>GitHub Pages Deployment</h3>

<p>This repository is structured for GitHub Pages deployment. Follow these steps:</p>

<ol>
    <li>Ensure your repository is named <code>amiteshray.github.io</code> (or <code>username.github.io</code>)</li>
    <li>Push all changes to the main branch:
        <div class="code-block">
            <code>git add .<br>git commit -m "Your commit message"<br>git push origin main</code>
        </div>
    </li>
    <li>GitHub will automatically deploy your site to <code>https://amiteshray.github.io</code></li>
    <li>To check deployment status, go to your repository's "Settings" tab > "Pages"</li>
</ol>

<h3>Custom Domain Setup (Optional)</h3>

<p>To use a custom domain (e.g., amiteshray.com):</p>

<ol>
    <li>Purchase a domain from a domain registrar (Namecheap, GoDaddy, etc.)</li>
    <li>In your GitHub repository, go to Settings > Pages > Custom domain</li>
    <li>Enter your domain name and save</li>
    <li>Configure DNS settings with your domain registrar:
        <ul>
            <li>Add an A record pointing to GitHub's IP addresses:
                <div class="code-block">
                    <code>185.199.108.153<br>185.199.109.153<br>185.199.110.153<br>185.199.111.153</code>
                </div>
            </li>
            <li>Or add a CNAME record pointing to <code>amiteshray.github.io</code></li>
        </ul>
    </li>
    <li>Wait for DNS propagation (can take up to 48 hours)</li>
    <li>Create a CNAME file in your repository root with your domain name</li>
</ol>

<h2>
    <i class="fas fa-wrench text-indigo-600 mr-2"></i>
    Maintenance Guide
</h2>

<h3>Updating Content</h3>

<p>To update your portfolio content:</p>

<ul>
    <li><strong>Personal Information</strong>: Edit the relevant sections in <code>index.html</code></li>
    <li><strong>Profile Picture</strong>: Replace <code>assets/images/profile.jpg</code> (keep the same name for simplicity)</li>
    <li><strong>Experience & Certifications</strong>: Modify the corresponding HTML sections in <code>index.html</code></li>
</ul>

<h3>Calculator Functionality</h3>

<p>The financial calculators are powered by the code in <code>js/calculators.js</code> with visualization handled by Chart.js.</p>

<ul>
    <li><strong>EMI Calculator</strong>: Functions for loan calculations and amortization schedule</li>
    <li><strong>NPV Calculator</strong>: Real estate investment analysis with cash flow projections</li>
    <li><strong>Retirement Calculator</strong>: Retirement corpus projections with SIP step-up option</li>
</ul>

<h3>Dark Mode</h3>

<p>Dark mode functionality is handled in <code>js/main.js</code> and corresponding CSS variables in <code>css/styles.css</code>. The toggle state is saved in localStorage for user preference persistence.</p>

<h2>
    <i class="fas fa-wordpress text-indigo-600 mr-2"></i>
    WordPress Integration
</h2>

<h3>Option 1: Custom WordPress Theme</h3>

<p>To convert this portfolio into a WordPress theme:</p>

<ol>
    <li>Create a new folder in <code>wp-content/themes/</code> called <code>amitesh-portfolio</code></li>
    <li>Create a <code>style.css</code> file with theme headers:
        <div class="code-block">
            <pre class="wp-code">/*
Theme Name: Amitesh Portfolio
Theme URI: https://amiteshray.com
Author: Amitesh Ray
Author URI: https://amiteshray.com
Description: Custom portfolio theme with financial calculators
Version: 1.0
License: GNU General Public License v2 or later
License URI: http://www.gnu.org/licenses/gpl-2.0.html
Text Domain: amitesh-portfolio
*/</pre>
        </div>
    </li>
    <li>Create necessary WordPress template files:
        <ul>
            <li><code>index.php</code> - Main template file</li>
            <li><code>functions.php</code> - Theme functions</li>
            <li><code>header.php</code> - Header template</li>
            <li><code>footer.php</code> - Footer template</li>
            <li><code>page.php</code> - Page template</li>
            <li><code>single.php</code> - Single post template</li>
        </ul>
    </li>
    <li>Register scripts and styles in <code>functions.php</code>:
        <div class="code-block">
            <pre class="wp-code">function amitesh_portfolio_scripts() {
    wp_enqueue_style('amitesh-main-style', 
        get_template_directory_uri() . '/css/styles.css');
    wp_enqueue_script('amitesh-calculator-script', 
        get_template_directory_uri() . '/js/calculators.js', 
        array('jquery', 'chart-js'), '1.0.0', true);
    wp_enqueue_script('amitesh-main-script', 
        get_template_directory_uri() . '/js/main.js', 
        array('jquery'), '1.0.0', true);
    wp_enqueue_script('chart-js', 
        'https://cdn.jsdelivr.net/npm/chart.js', array(), null, true);
}
add_action('wp_enqueue_scripts', 'amitesh_portfolio_scripts');</pre>
        </div>
    </li>
</ol>

<h3>Option 2: WordPress Plugin for Calculators</h3>

<p>To create a plugin for just the financial calculators:</p>

<ol>
    <li>Create a folder in <code>wp-content/plugins/</code> called <code>amitesh-financial-calculators</code></li>
    <li>Create the main plugin file <code>amitesh-financial-calculators.php</code>:
        <div class="code-block">
            <pre class="wp-code">/*
Plugin Name: Amitesh Financial Calculators
Plugin URI: https://amiteshray.com
Description: Financial calculator tools including EMI, NPV, and Retirement calculators
Version: 1.0
Author: Amitesh Ray
Author URI: https://amiteshray.com
License: GPL2
*/

// Register styles and scripts
function afc_enqueue_scripts() {
    wp_enqueue_style('afc-styles', 
        plugin_dir_url(__FILE__) . 'css/calculator-styles.css');
    wp_enqueue_script('chart-js', 
        'https://cdn.jsdelivr.net/npm/chart.js', array(), null, true);
    wp_enqueue_script('afc-scripts', 
        plugin_dir_url(__FILE__) . 'js/calculators.js', 
        array('jquery', 'chart-js'), '1.0.0', true);
}
add_action('wp_enqueue_scripts', 'afc_enqueue_scripts');

// EMI Calculator Shortcode
function emi_calculator_shortcode() {
    ob_start();
    include_once plugin_dir_path(__FILE__) . 'templates/emi-calculator.php';
    return ob_get_clean();
}
add_shortcode('emi_calculator', 'emi_calculator_shortcode');

// NPV Calculator Shortcode
function npv_calculator_shortcode() {
    ob_start();
    include_once plugin_dir_path(__FILE__) . 'templates/npv-calculator.php';
    return ob_get_clean();
}
add_shortcode('npv_calculator', 'npv_calculator_shortcode');

// Retirement Calculator Shortcode
function retirement_calculator_shortcode() {
    ob_start();
    include_once plugin_dir_path(__FILE__) . 'templates/retirement-calculator.php';
    return ob_get_clean();
}
add_shortcode('retirement_calculator', 'retirement_calculator_shortcode');</pre>
        </div>
    </li>
    <li>Create template files for each calculator in a <code>templates/</code> subdirectory</li>
    <li>Use shortcodes to embed calculators in any WordPress page:
        <div class="code-block">
            <code>[emi_calculator]<br>[npv_calculator]<br>[retirement_calculator]</code>
        </div>
    </li>
</ol>

<h2>
    <i class="fas fa-question-circle text-indigo-600 mr-2"></i>
    Troubleshooting
</h2>

<h3>Common Issues</h3>

<ul>
    <li><strong>Calculator Not Working</strong>: Check browser console for JavaScript errors. Ensure Chart.js is properly loaded.</li>
    <li><strong>Dark Mode Toggle Issues</strong>: Clear localStorage in browser if dark mode gets stuck.</li>
    <li><strong>Images Not Loading</strong>: Verify file paths are correct relative to the HTML file.</li>
    <li><strong>GitHub Pages Not Updating</strong>: Check GitHub Actions tab for deployment status and errors.</li>
</ul>

<h3>Browser Compatibility</h3>

<p>This portfolio is tested and works on:</p>
<ul>
    <li>Chrome (latest)</li>
    <li>Firefox (latest)</li>
    <li>Safari (latest)</li>
    <li>Edge (latest)</li>
</ul>

<p>For mobile compatibility, the design is responsive and tested on iOS and Android devices.</p>

<h2>
    <i class="fas fa-code-branch text-indigo-600 mr-2"></i>
    Future Development
</h2>

<p>Planned enhancements for this portfolio:</p>

<ul>
    <li>Integration with WordPress for blog functionality</li>
    <li>Additional financial calculators and tools</li>
    <li>Performance optimizations for mobile devices</li>
    <li>Progressive Web App (PWA) capabilities</li>
</ul>

<h2>
    <i class="fas fa-copyright text-indigo-600 mr-2"></i>
    License
</h2>

<p>This project is licensed under the MIT License - see the LICENSE file for details.</p>

<div class="mt-8 text-center text-gray-600">
    <p>© 2024 Amitesh Ray. All rights reserved.</p>
</div>

</body>
</html>

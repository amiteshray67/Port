// Theme Toggle
document.addEventListener('DOMContentLoaded', function() {
    const themeToggle = document.getElementById('darkModeToggle');
    const body = document.body;

    // Check for saved theme preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        body.classList.add(savedTheme);
        updateThemeIcon();
    }

    // Check system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches && !savedTheme) {
        body.classList.add('dark-mode');
        updateThemeIcon();
    }

    themeToggle.addEventListener('click', () => {
        body.classList.toggle('dark-mode');
        const theme = body.classList.contains('dark-mode') ? 'dark-mode' : '';
        localStorage.setItem('theme', theme);
        updateThemeIcon();
    });

    function updateThemeIcon() {
        const icon = themeToggle.querySelector('i');
        if (body.classList.contains('dark-mode')) {
            icon.classList.remove('fa-moon');
            icon.classList.add('fa-sun');
        } else {
            icon.classList.remove('fa-sun');
            icon.classList.add('fa-moon');
        }
    }
});

// Mobile Navigation
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');

if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        hamburger.classList.toggle('active');
    });

    // Close mobile menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!hamburger.contains(e.target) && !navLinks.contains(e.target)) {
            navLinks.classList.remove('active');
            hamburger.classList.remove('active');
        }
    });
}

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const targetAttr = this.getAttribute('href');
        if (targetAttr === '#') return; // Guard clause for basic hash links
        
        e.preventDefault();
        const target = document.querySelector(targetAttr);
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
            // Close mobile menu after clicking
            if (navLinks && hamburger) {
                navLinks.classList.remove('active');
                hamburger.classList.remove('active');
            }
        }
    });
});

// Initialize AOS
if (typeof AOS !== 'undefined') {
    AOS.init({
        duration: 800,
        easing: 'ease-in-out',
        once: true
    });
}

// Back to Top Button
document.addEventListener('DOMContentLoaded', function() {
    const backToTopButton = document.getElementById('backToTop');

    // Show/hide button based on scroll position
    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 300) {
            backToTopButton.classList.add('show');
        } else {
            backToTopButton.classList.remove('show');
        }
    });

    // Smooth scroll to top when clicked
    backToTopButton.addEventListener('click', (e) => {
        e.preventDefault();
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
});


// Add all other JavaScript functions from the HTML file here

// Auto-select input text on focus globally
const inputs = document.querySelectorAll('.form-input');
inputs.forEach(input => {
    input.addEventListener('focus', function() {
        if (!this.dataset.modified) {
            this.value = '';
            this.dataset.modified = true;
        }
    });
});

// Contact form submission handler
const contactForm = document.getElementById('contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        alert("Thank you for your message! I will get back to you shortly.");
        contactForm.reset();
    });
}

// ----------------------------------------------------
//     EXPERIENCE TIMELINE LOGIC AND DATABASE
// ----------------------------------------------------
const experienceData = {
    arcesium: {
        role: "Finance Analyst",
        companyDate: "Arcesium | May 2025 - Present",
        details: [
            "<strong>Managed Middle Office operations</strong> for 4 Hedge Fund clients during US Night Shift, serving as the primary contact for live market requests and high-priority trade amendments.",
            "<strong>Handled end-to-end trade lifecycles</strong> via the Arcesium Opterra platform for complex products (Swaps, Swaptions, FX Options, and Fixed Income), guaranteeing accurate settlement.",
            "Facilitated <strong>Reference Data creation</strong> and security master setups for new fund onboarding processes.",
            "Resolved trade kickouts natively by investigating data errors to ensure <strong>100% adherence</strong> to Client SLAs.",
            "<strong>Automated daily tasks</strong> natively using Python, Excel Macros, and Generative AI, successfully increasing departmental efficiency by up to <strong>20%</strong>."
        ]
    },
    bloomberg: {
        role: "Bloomberg Champion",
        companyDate: "Bloomberg | Mar 2024 - Mar 2025",
        details: [
            "<strong>1st Runner-Up</strong> in the highly competitive TAPMI Bloomberg Olympiad 2025.",
            "<strong>Represented TAPMI</strong> securely at the CFA Research Challenge.",
            "Acquired <strong>40+ hours of extensive training</strong> from Bloomberg professionals on Financial Statement Analysis and predictive Valuation models.",
            "Assisted academic professors directly in high-level research using financial data arrays sourced from the Bloomberg terminal.",
            "<strong>Conducted terminal training</strong> for 700+ university students and successfully managed the completion of BMC & ESG certifications for 500+ students, significantly increasing campus-wide terminal usage."
        ]
    },
    samnidhy: {
        role: "Sr. Equity Research Analyst",
        companyDate: "Samnidhy | Mar 2024 - Mar 2025",
        details: [
            "<strong>Spearheaded equity research</strong> initiatives and directed overarching strategy formulations.",
            "Conducted highly <strong>in-depth fundamental analyses</strong> of companies spanning multiple diverse financial sectors.",
            "Consistently provided detailed and actionable investment recommendations and extensive research reporting.",
            "Played a pivotal role in mentoring junior analysts on market trends and risk assessment formulas."
        ]
    },
    bluecopper: {
        role: "Market Research Intern",
        companyDate: "Blue Copper Technologies | Apr 2024 - Jun 2024",
        details: [
            "Executed deep secondary market research to identify core customer pain points, actively <strong>refining client acquisition strategies</strong>.",
            "Designed a highly complex ZAPIER workflow for comprehensive content automation, radically reducing manual work bottlenecks by <strong>up to 70%</strong> and overall operating cost by <strong>83%</strong>.",
            "Conducted thorough competitive analysis on <strong>7+ major payment rails</strong>, strategically selecting the absolute optimal option for business revenue operations."
        ]
    }
};

// Populate timeline detail panels on page load
document.addEventListener('DOMContentLoaded', () => {
    Object.keys(experienceData).forEach(key => {
        const detailsPanel = document.getElementById(`details-${key}`);
        if (detailsPanel) {
            let listHtml = '<ul>';
            experienceData[key].details.forEach(detail => {
                listHtml += `<li>${detail}</li>`;
            });
            listHtml += '</ul>';
            detailsPanel.innerHTML = listHtml;
        }
    });
});

// Timeline accordion: click header to toggle, close others
const tlItems = document.querySelectorAll('.tl-item[data-exp]');
tlItems.forEach(item => {
    const header = item.querySelector('.tl-header');
    header.addEventListener('click', () => {
        const isActive = item.classList.contains('active');

        // Close all items
        tlItems.forEach(other => other.classList.remove('active'));

        // If it wasn't already open, open it
        if (!isActive) {
            item.classList.add('active');
        }
    });
});


// Timeline Data - Chronological Order
const timelineData = [
    {
        year: 1997,
        title: "Humble Beginnings",
        icon: "🌱",
        isXTech: true,
        content: "Founded in Oklahoma City with a simple mission: help small businesses find and implement the right technology solutions. Early recognition that successful technology adoption requires understanding both the technical and human sides of change."
    },
    {
        year: "1999-2000",
        title: "Y2K Challenge",
        icon: "📅",
        isTech: true,
        content: "The year 2000 transition demonstrated the critical importance of legacy system management and forward-thinking infrastructure planning—principles that remain central to our practice today."
    },
    {
        year: 2001,
        title: "Windows XP Era",
        icon: "💻",
        isTech: true,
        content: "Enterprise computing matured with stable, user-friendly platforms, enabling broader SMB adoption of standardized IT infrastructure."
    },
    {
        year: 2002,
        title: "Managed IT Services",
        icon: "🖥️",
        isXTech: true,
        content: "Transitioned into full IT Support Services for SMBs, establishing managed service expertise serving the Oklahoma City metro area. Initial vertical focus: property management and event center operations."
    },
    {
        year: 2007,
        title: "Storage Revolution",
        icon: "⚡",
        isTech: true,
        content: "Solid-state drives emerged, enabling faster, more reliable computing and reshaping enterprise infrastructure strategies."
    },
    {
        year: 2008,
        title: "Document Management Evolution",
        icon: "📄",
        isXTech: true,
        content: "Recognized the strategic opportunity beyond IT support. Began consulting on document management using on-premise applications, delivering direct business impact through client efficiency and profitability gains."
    },
    {
        year: 2009,
        title: "Blockchain Foundations",
        icon: "🔗",
        isTech: true,
        content: "Bitcoin introduced distributed ledger technology, reshaping how organizations think about trust, data integrity, and secure record-keeping."
    },
    {
        year: 2011,
        title: "Records Management Phase 1",
        icon: "📋",
        isXTech: true,
        content: "Shifted methodology to position document and records management as the foundation for workflow automation, enabling higher ROI and stronger process control across client operations."
    },
    {
        year: 2013,
        title: "eForms Implementation",
        icon: "✍️",
        isXTech: true,
        content: "Deployed intelligent eForms applications that transformed user engagement. Created intuitive experiences for internal and external users, dramatically improving process lifecycle efficiency and adoption."
    },
    {
        year: "2010s",
        title: "Cloud Maturity",
        icon: "☁️",
        isTech: true,
        content: "Cloud computing evolved from emerging technology to business necessity. We guided SMBs through hybrid and cloud-first transitions, unlocking new operational possibilities."
    },
    {
        year: 2018,
        title: "IDP & AI/ML Era",
        icon: "🔍",
        isXTech: true,
        content: "Recognized the transformative potential of IDP and AI/ML-powered capture technology. Advanced automation could eliminate the critical digitization bottleneck that had long constrained workflow efficiency."
    },
    {
        year: 2022,
        title: "Computer Vision Advancement",
        icon: "👁️",
        isXTech: true,
        content: "Adopted convolutional neural networks and modern vision technologies to replace legacy OCR. Dramatically improved accuracy in text and intelligent character recognition (ICR), further reducing digitization bottlenecks."
    },
    {
        year: "2022b",
        title: "LLMs & Generative AI",
        icon: "🤖",
        isTech: true,
        content: "ChatGPT democratized LLMs, making enterprise AI accessible and sparking a new era of intelligent automation and knowledge extraction."
    },
    {
        year: 2024,
        title: "LLM-Driven AI Strategy",
        icon: "✨",
        isXTech: true,
        content: "Deployed LLM-powered AI to unlock insights from dormant records repositories and business applications. More importantly, identified where NOT to use AI and how to avoid AI fatigue—helping clients implement pragmatic AI that delivers measurable outcomes."
    },
    {
        year: "Today",
        title: "Full-Stack Partner",
        icon: "🚀",
        isXTech: true,
        content: "Drawing on 25+ years of evolution—from IT support to document management to AI-powered automation—we partner with SMBs to diagnose friction, architect sustainable solutions, and deliver measurable outcomes at scale."
    }
];

const contentDisplay = document.getElementById('contentDisplay');

function displayContent(item) {
    const techLabel = item.isTech ? '<span class="tech-label">📍 Industry Milestone</span>' : '';
    const yearDisplay = String(item.year).replace('b', '');
    
    // Animate content removal and fade in
    contentDisplay.style.opacity = 0;
    
    setTimeout(() => {
        contentDisplay.className = `timeline-content-display ${item.isTech ? 'tech' : ''}`;
        contentDisplay.innerHTML = `
            <div class="year">${yearDisplay}</div>
            <h2>${item.title}</h2>
            <p>${item.content}</p>
            ${techLabel}
        `;
        contentDisplay.style.opacity = 1;
    }, 200); // Small delay to allow the fade out transition
}

// Function to handle Intersection Observer logic
function handleIntersection(entries, observer) {
    entries.forEach(entry => {
        const bubble = entry.target;
        
        // Determine if the element is actively centered (intersectionRatio close to 1)
        if (entry.isIntersecting && entry.intersectionRatio >= 0.8) {
            
            // Remove active class from all bubbles
            document.querySelectorAll('.timeline-bubble').forEach(b => b.classList.remove('active'));
            
            // Add active class to the currently centered bubble
            bubble.classList.add('active');
            
            // Find the corresponding data object
            const yearData = bubble.getAttribute('data-year');
            const currentItem = timelineData.find(item => String(item.year) === yearData);
            
            if (currentItem) {
                displayContent(currentItem);
            }
        }
    });
}

// Initialize Timeline and Observer
function initTimeline() {
    const timelineItems = document.getElementById('timelineItems');
    
    // Create the Intersection Observer
    // rootMargin is used to define the 'center' area where the item must intersect
    // threshold: 1.0 means when 100% of the target is visible, but we use a lower threshold (0.8)
    // to give it a slightly wider "active" zone for the snap-scroll.
    const observerOptions = {
        root: timelineItems,
        rootMargin: '0px',
        threshold: 0.8
    };
    
    const observer = new IntersectionObserver(handleIntersection, observerOptions);

    // Create bubbles and start observing
    timelineData.forEach((item, index) => {
        const bubble = document.createElement('div');
        bubble.className = `timeline-bubble ${item.isTech ? 'tech' : ''}`;
        bubble.setAttribute('data-year', item.year); // Store year for lookup
        bubble.innerHTML = `
            <div class="bubble-icon">${item.icon}</div>
            <div class="bubble-label">${String(item.year).replace('b', '')}</div>
        `;
        
        // Manual click to scroll to the item
        bubble.addEventListener('click', () => {
            bubble.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        });
        
        timelineItems.appendChild(bubble);
        
        // Attach observer to the bubble
        observer.observe(bubble);
        
        // Initial setup for the very first item
        if (index === 0) {
            bubble.classList.add('active');
            displayContent(item);
        }
    });
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', initTimeline);
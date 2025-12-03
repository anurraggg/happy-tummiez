// Google Analytics Configuration
// Replace 'G-XXXXXXXXXX' with your actual Google Analytics Measurement ID

export const GA_MEASUREMENT_ID = 'G-LCWJ2SHBVH'; // Your Google Analytics Measurement ID

// Initialize Google Analytics
export function initGA() {
    // Load gtag.js script
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
    document.head.appendChild(script);

    // Initialize dataLayer and gtag
    window.dataLayer = window.dataLayer || [];
    function gtag() {
        window.dataLayer.push(arguments);
    }
    window.gtag = gtag;

    gtag('js', new Date());
    gtag('config', GA_MEASUREMENT_ID, {
        page_path: window.location.pathname,
    });
}

// Track page views
export function trackPageView(pagePath) {
    if (window.gtag) {
        window.gtag('config', GA_MEASUREMENT_ID, {
            page_path: pagePath,
        });
    }
}

// Track custom events
export function trackEvent(eventName, eventParams = {}) {
    if (window.gtag) {
        window.gtag('event', eventName, eventParams);
    }
}

// Track game plays
export function trackGamePlay(gameName) {
    trackEvent('game_play', {
        game_name: gameName,
    });
}

// Track quiz completion
export function trackQuizComplete(score) {
    trackEvent('quiz_complete', {
        quiz_name: 'DQ_Test',
        score: score,
    });
}

// Track user authentication
export function trackAuth(action) {
    trackEvent('auth_action', {
        action: action, // 'login', 'signup', 'logout'
    });
}

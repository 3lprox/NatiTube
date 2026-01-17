// ==UserScript==
// @name         NatiTube
// @version      2.1
// @description  Opens YouTube videos in the native system player and enhances the web experience.
// @author       3lprox
// @match        *://*.youtube.com/*
// @grant        none
// @run-at       document-end
// ==/UserScript==

(function() {
    'use strict';

    // --- CORE LOGIC: ROBUST NATIVE LAUNCHER ---
    // This function waits for the video metadata to ensure the source (blob/url) is ready.
    const openInNativePlayer = () => {
        const videoElement = document.querySelector('video');
        
        if (videoElement && !videoElement.getAttribute('data-natitube-active')) {
            const launch = () => {
                if (videoElement.src && videoElement.src !== "") {
                    videoElement.setAttribute('data-natitube-active', 'true');
                    
                    // Stop the web player to save bandwidth
                    videoElement.pause();
                    
                    // Trigger the native system player
                    window.location.href = videoElement.src;
                }
            };

            // If metadata is already loaded, launch immediately. 
            // Otherwise, wait for the 'loadedmetadata' event.
            if (videoElement.readyState >= 1) {
                launch();
            } else {
                videoElement.addEventListener('loadedmetadata', launch, { once: true });
            }
        }
    };

    // Monitor for video changes (Single Page Application navigation)
    const observer = new MutationObserver(() => {
        if (window.location.pathname === '/watch') {
            openInNativePlayer();
        }
    });

    observer.observe(document.body, { childList: true, subtree: true });

    // Initial check in case the page loads directly on a video
    if (window.location.pathname === '/watch') {
        openInNativePlayer();
    }

    // ========================================================
    // NATITUBE PLUGINS AREA
    // Feel free to add or remove snippets below.
    // ========================================================

    // [Plugin 1] Background Play Enabler
    // Keeps audio playing when switching tabs or locking the screen.
    Object.defineProperty(document, 'visibilityState', { get: () => 'visible', configurable: true });
    Object.defineProperty(document, 'hidden', { get: () => false, configurable: true });
    window.addEventListener('visibilitychange', (e) => { e.stopImmediatePropagation(); }, true);

    // [Plugin 2] Auto-Lite Mode
    // Removes heavy UI elements like comments and related grids for faster loading.
    const cleanNatiUI = () => {
        const selectors = [
            '#comments', 
            '#related', 
            'ytm-item-section-renderer[section-identifier="comment-item-section"]',
            'ytm-rich-section-renderer'
        ];
        selectors.forEach(s => {
            const el = document.querySelector(s);
            if (el) el.style.display = 'none';
        });
    };
    setInterval(cleanNatiUI, 1000);

    // ========================================================
    // USER PLUGINS AREA (Paste your custom snippets below)
    // ========================================================
    
    /* [YOUR CODE HERE] */

    // ========================================================

})();

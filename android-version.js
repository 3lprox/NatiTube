// ==UserScript==
// @name         NatiTube Android - Native PiP & Player
// @namespace    http://tampermonkey.net/
// @version      2.0
// @description  Force native Picture-in-Picture and enhance the mobile YouTube experience.
// @author       3lprox
// @match        https://m.youtube.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=youtube.com
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // --- CORE LOGIC: NATIVE PiP ---
    async function activateNativePiP() {
        const video = document.querySelector('video');
        
        if (!video) {
            console.log("NatiTube: No video found.");
            return;
        }

        try {
            if (document.pictureInPictureEnabled && !video.disablePictureInPicture) {
                await video.requestPictureInPicture();
            } else if (video.webkitSupportsPresentationMode && typeof video.webkitSetPresentationMode === "function") {
                video.webkitSetPresentationMode("picture-in-picture");
            } else {
                video.requestFullscreen();
            }
        } catch (error) {
            console.error("NatiTube Error:", error);
        }
    }

    // --- UI: FLOATING BUTTON ---
    const pipBtn = document.createElement('button');
    pipBtn.textContent = 'PiP'; // Text instead of emoji for GitHub standards
    pipBtn.setAttribute('style', `
        position: fixed;
        bottom: 100px;
        right: 20px;
        z-index: 999999;
        width: 50px;
        height: 50px;
        background-color: #FF0000;
        color: white;
        border: none;
        border-radius: 50%;
        box-shadow: 0 4px 12px rgba(0,0,0,0.4);
        font-size: 14px;
        font-weight: bold;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        -webkit-tap-highlight-color: transparent;
    `);

    pipBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        activateNativePiP();
    });

    document.body.appendChild(pipBtn);

    // ========================================================
    // NATITUBE PLUGINS AREA
    // ========================================================

    // [Plugin 1] Background Play Enabler
    Object.defineProperty(document, 'visibilityState', { get: () => 'visible', configurable: true });
    Object.defineProperty(document, 'hidden', { get: () => false, configurable: true });
    window.addEventListener('visibilitychange', (e) => { e.stopImmediatePropagation(); }, true);

    // [Plugin 2] Auto-Lite Mode
    const cleanNatiUI = () => {
        const selectors = ['#comments', '#related', 'ytm-item-section-renderer[section-identifier="comment-item-section"]'];
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

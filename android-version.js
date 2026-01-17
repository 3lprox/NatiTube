


//PLS READ ME

//THIS VERSION IS CORRUOTED PLS WAIT THE NEW VERSION




// ==UserScript==
// @name         NatiTube - Force Native Player
// @namespace    http://tampermonkey.net/
// @version      5.0
// @description  Forces the native system player by targeting the video source directly.
// @author       3lprox
// @match        https://m.youtube.com/*
// @grant        none
// @run-at       document-start
// ==/UserScript==

(function() {
    'use strict';

    // --- CONFIG ---
    const CHECK_INTERVAL = 1000; // Checking every second for the source

    // --- CORE LOGIC: THE HUNTER ---
    const forceNativePlayer = () => {
        const video = document.querySelector('video');

        // We check if the video has a source (blob or direct link)
        if (video && video.src && video.src !== "" && !video.getAttribute('data-nati-fired')) {
            
            console.log("NatiTube: Source found! Launching native player...");
            
            // Mark as fired to avoid infinite reload loops
            video.setAttribute('data-nati-fired', 'true');

            // FORCE REDIRECT: This is what triggers the system player (Android/iOS)
            // It sends the video source directly to the browser's URL handler
            window.location.href = video.src;
            
            // Safety measure: Stop the web player
            video.pause();
        }
    };

    // --- ETERNAL LOOP ---
    // It stays at the top of the YouTube web, waiting for the file to appear
    setInterval(() => {
        if (window.location.pathname === '/watch') {
            forceNativePlayer();
        }
    }, CHECK_INTERVAL);

})();

// ==UserScript==
// @name         NatiTube - Space Layer Edition (Blob Fix)
// @version      6.1
// @description  Moves YouTube player to space and bridges the stream to the native top layer.
// @author       3lprox
// @match        https://m.youtube.com/*
// @grant        none
// @run-at       document-start
// ==/UserScript==

(function() {
    'use strict';

    // 1. Create the Native Overlay
    const nativeLayer = document.createElement('video');
    nativeLayer.controls = true;
    nativeLayer.autoplay = true;
    nativeLayer.id = "nati-layer-top";
    nativeLayer.setAttribute('style', `
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: black;
        z-index: 2147483647; 
        display: none;
    `);
    document.documentElement.appendChild(nativeLayer);

    const bridgeStream = () => {
        const ytPlayer = document.querySelector('.html5-video-player');
        const ytVideo = document.querySelector('video:not(#nati-layer-top)');

        if (ytPlayer) {
            // Send YouTube's player to space
            ytPlayer.style.setProperty('position', 'fixed', 'important');
            ytPlayer.style.setProperty('top', '-9999px', 'important');
        }

        if (ytVideo && ytVideo.src) {
            nativeLayer.style.display = 'block';

            // BLOB BRIDGE: If src is a blob, we must capture the stream
            if (ytVideo.src.startsWith('blob:') && !nativeLayer.getAttribute('data-bridged')) {
                try {
                    // We capture the stream from the YouTube video and pass it to our layer
                    const stream = ytVideo.captureStream ? ytVideo.captureStream() : ytVideo.mozCaptureStream();
                    nativeLayer.srcObject = stream;
                    nativeLayer.setAttribute('data-bridged', 'true');
                    
                    // Keep original video playing in the dark to feed the stream
                    ytVideo.play();
                } catch (e) {
                    // Fallback for direct sources
                    if (nativeLayer.src !== ytVideo.src) {
                        nativeLayer.src = ytVideo.src;
                    }
                }
            }
        }
    };

    // Check every 1000ms
    setInterval(() => {
        if (window.location.pathname === '/watch') {
            bridgeStream();
        } else {
            nativeLayer.style.display = 'none';
            if (nativeLayer.srcObject) {
                nativeLayer.srcObject.getTracks().forEach(track => track.stop());
                nativeLayer.srcObject = null;
            }
            nativeLayer.src = "";
            nativeLayer.removeAttribute('data-bridged');
        }
    }, 1000);

})();

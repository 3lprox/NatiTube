// ==UserScript==
// @name         NatiTube - Space Layer V2 (Fixed)
// @version      7.1
// @description  Native layer for video with background audio sync and UI access.
// @author       3lprox
// @match        https://m.youtube.com/*
// @grant        none
// @run-at       document-start
// ==/UserScript==

(function () {
    'use strict';

    let nativeLayer;
    let bridgedVideo = null;

    function createNativeLayer() {
        if (nativeLayer) return;

        nativeLayer = document.createElement('video');
        nativeLayer.id = 'nati-layer-top';
        nativeLayer.controls = true;
        nativeLayer.autoplay = true;
        nativeLayer.muted = true; // usamos el audio original de YouTube
        nativeLayer.playsInline = true;

        nativeLayer.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 56.25vw;
            background: black;
            z-index: 2147483647;
            display: none;
        `;

        document.documentElement.appendChild(nativeLayer);
    }

    function getYTVideo() {
        return document.querySelector('video.html5-main-video');
    }

    function bridgeStream() {
        if (location.pathname !== '/watch') {
            reset();
            return;
        }

        createNativeLayer();

        const ytVideo = getYTVideo();
        if (!ytVideo || !ytVideo.src) return;

        nativeLayer.style.display = 'block';
        document.body.style.marginTop = '56.25vw';

        // Crear stream solo una vez
        if (bridgedVideo !== ytVideo) {
            try {
                const stream = ytVideo.captureStream
                    ? ytVideo.captureStream()
                    : ytVideo.mozCaptureStream();

                nativeLayer.srcObject = stream;
                bridgedVideo = ytVideo;
            } catch (e) {
                console.error('NatiTube stream error:', e);
            }
        }

        // Sincronización
        if (Math.abs(nativeLayer.currentTime - ytVideo.currentTime) > 0.3) {
            nativeLayer.currentTime = ytVideo.currentTime;
        }

        nativeLayer.playbackRate = ytVideo.playbackRate;

        if (ytVideo.paused && !nativeLayer.paused) {
            nativeLayer.pause();
        } else if (!ytVideo.paused && nativeLayer.paused) {
            nativeLayer.play().catch(() => {});
        }

        // Ocultar player original pero dejar la UI funcional
        const ytPlayer = document.querySelector('.html5-video-player');
        if (ytPlayer) {
            ytPlayer.style.visibility = 'hidden';
        }
    }

    function reset() {
        if (!nativeLayer) return;

        nativeLayer.style.display = 'none';
        nativeLayer.srcObject = null;
        bridgedVideo = null;
        document.body.style.marginTop = '0';

        const ytPlayer = document.querySelector('.html5-video-player');
        if (ytPlayer) {
            ytPlayer.style.visibility = '';
        }
    }

    // Loop ligero de sincronización
    setInterval(bridgeStream, 800);

})();

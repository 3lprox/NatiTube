// ==UserScript==
// @name         NatiTube - Tahoe
// @version      7.1.1
// @description  Native layer with subtitles, speed and seek control.
// @author       3lprox
// @match        https://m.youtube.com/*
// @grant        none
// @run-at       document-start
// ==/UserScript==

(function () {
    'use strict';

    let nativeLayer;
    let bridgedVideo = null;
    let lastUrl = location.href;
    let uiContainer;
    let isDragging = false;

    function setupNativeLayer() {
        if (document.getElementById('nati-layer-tahoe')) return;
        
        nativeLayer = document.createElement('video');
        nativeLayer.id = 'nati-layer-tahoe';
        nativeLayer.controls = false;
        nativeLayer.autoplay = true;
        nativeLayer.muted = true;
        nativeLayer.playsInline = true;
        nativeLayer.style.cssText = "position:fixed;top:0;left:0;width:100vw;height:56.25vw;background:#000;z-index:2147483647;display:none;object-fit:contain;";
        
        uiContainer = document.createElement('div');
        uiContainer.style.cssText = "position:fixed;top:56.25vw;left:0;width:100%;z-index:2147483646;display:none;flex-direction:column;background:#1C1B1F;box-sizing:border-box;border-bottom:1px solid #49454F;box-shadow:0 4px 6px rgba(0,0,0,0.3);padding:12px;gap:10px;";
        
        const seekBar = document.createElement('input');
        seekBar.type = 'range';
        seekBar.min = 0;
        seekBar.value = 0;
        seekBar.style.cssText = "width:100%;height:6px;accent-color:#D0BCFF;cursor:pointer;margin:0;";
        
        seekBar.oninput = () => { isDragging = true; };
        seekBar.onchange = () => {
            const ytVideo = document.querySelector('video.html5-main-video');
            if (ytVideo) ytVideo.currentTime = (seekBar.value / 100) * ytVideo.duration;
            isDragging = false;
        };

        const controlsRow = document.createElement('div');
        controlsRow.style.cssText = "display:flex;justify-content:space-between;align-items:center;width:100%;gap:8px;flex-wrap:wrap;";

        const leftGroup = document.createElement('div');
        leftGroup.style.cssText = "display:flex;gap:8px;align-items:center;";

        const timeDisplay = document.createElement('div');
        timeDisplay.id = 'nati-time';
        timeDisplay.style.cssText = "color:#E6E1E5;font-family:monospace;font-size:12px;min-width:85px;";
        timeDisplay.innerText = "00:00 / 00:00";

        const btnJump = document.createElement('button');
        btnJump.innerText = "+10s";
        btnJump.style.cssText = "padding:6px 12px;background:#49454F;color:#E6E1E5;border:none;border-radius:16px;font-size:11px;font-weight:600;";
        btnJump.onclick = () => {
            const ytVideo = document.querySelector('video.html5-main-video');
            if(ytVideo) ytVideo.currentTime += 10;
        };

        const rightGroup = document.createElement('div');
        rightGroup.style.cssText = "display:flex;gap:8px;align-items:center;";

        const btnSubs = document.createElement('button');
        btnSubs.innerText = "CC";
        btnSubs.style.cssText = "padding:6px 12px;background:#49454F;color:#E6E1E5;border:none;border-radius:16px;font-size:11px;font-weight:600;";
        btnSubs.onclick = () => {
            const subBtn = document.querySelector('.ytp-subtitles-button') || document.querySelector('.player-controls-bottom [aria-label*="subtítulos"]');
            if (subBtn) subBtn.click();
        };

        const btnSpeed = document.createElement('button');
        btnSpeed.innerText = "1x";
        btnSpeed.style.cssText = "padding:6px 12px;background:#D0BCFF;color:#381E72;border:none;border-radius:16px;font-size:11px;font-weight:600;";
        btnSpeed.onclick = () => {
            const rates = [1, 1.25, 1.5, 2];
            let next = rates[(rates.indexOf(nativeLayer.playbackRate) + 1) % rates.length];
            const ytVideo = document.querySelector('video.html5-main-video');
            if(ytVideo) ytVideo.playbackRate = next;
            nativeLayer.playbackRate = next;
            btnSpeed.innerText = next + "x";
        };

        leftGroup.appendChild(timeDisplay);
        leftGroup.appendChild(btnJump);
        rightGroup.appendChild(btnSubs);
        rightGroup.appendChild(btnSpeed);
        controlsRow.appendChild(leftGroup);
        controlsRow.appendChild(rightGroup);
        
        uiContainer.appendChild(seekBar);
        uiContainer.appendChild(controlsRow);
        
        document.documentElement.appendChild(nativeLayer);
        document.documentElement.appendChild(uiContainer);
        
        nativeLayer.onclick = () => {
            const ytVideo = document.querySelector('video.html5-main-video');
            if (ytVideo) ytVideo.paused ? ytVideo.play() : ytVideo.pause();
        };
    }

    function formatTime(s) {
        if (isNaN(s) || !isFinite(s)) return "00:00";
        const m = Math.floor(s / 60);
        const sec = Math.floor(s % 60);
        return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
    }

    function bridgeStream(force = false) {
        if (location.pathname !== '/watch') {
            reset();
            return;
        }

        setupNativeLayer();
        const ytVideo = document.querySelector('video.html5-main-video');
        if (!ytVideo) return;

        if (location.href !== lastUrl) {
            lastUrl = location.href;
            nativeLayer.style.display = 'none';
            uiContainer.style.display = 'none';
            setTimeout(() => bridgeStream(true), 1000);
            return;
        }

        nativeLayer.style.display = 'block';
        uiContainer.style.display = 'flex';
        document.body.style.marginTop = "calc(56.25vw + 80px)";

        if (bridgedVideo !== ytVideo || force) {
            try {
                const stream = ytVideo.captureStream ? ytVideo.captureStream() : ytVideo.mozCaptureStream();
                nativeLayer.srcObject = stream;
                bridgedVideo = ytVideo;
            } catch (e) {}
        }

        const timeDisplay = document.getElementById('nati-time');
        const seekBar = uiContainer.querySelector('input');
        if (timeDisplay && !isDragging) {
            timeDisplay.innerText = `${formatTime(ytVideo.currentTime)} / ${formatTime(ytVideo.duration)}`;
            seekBar.value = (ytVideo.currentTime / ytVideo.duration) * 100 || 0;
        }

        if (Math.abs(nativeLayer.currentTime - ytVideo.currentTime) > 0.3) {
            nativeLayer.currentTime = ytVideo.currentTime;
        }
        
        nativeLayer.playbackRate = ytVideo.playbackRate;
        if (ytVideo.paused !== nativeLayer.paused) {
            ytVideo.paused ? nativeLayer.pause() : nativeLayer.play().catch(()=>{});
        }

        const ytPlayer = document.querySelector('.html5-video-player');
        if (ytPlayer) {
            ytPlayer.style.visibility = 'hidden';
            const subsContainer = document.querySelector('.ytp-caption-window-container');
            if (subsContainer) {
                subsContainer.style.visibility = 'visible';
                subsContainer.style.zIndex = "2147483647";
                subsContainer.style.bottom = "45vw";
            }
        }
    }

    function reset() {
        if (nativeLayer) {
            nativeLayer.style.display = 'none';
            uiContainer.style.display = 'none';
            nativeLayer.srcObject = null;
            bridgedVideo = null;
            document.body.style.marginTop = '0';
        }
        const ytPlayer = document.querySelector('.html5-video-player');
        if (ytPlayer) ytPlayer.style.visibility = '';
    }

    setInterval(bridgeStream, 800);
})();

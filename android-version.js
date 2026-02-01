 // ==UserScript==
// @name NatiTube - Tahoe
// @version 7.1.1
// @description Native scrollable layer with Blob downloader
// @author 3lprox
// @match https://m.youtube.com/*
// @grant none
// @run-at document-start
// ==/UserScript==

(function () {
'use strict';

let nativeVideo;
let bridgedVideo = null;
let lastUrl = location.href;
let mediaRecorder;
let recordedChunks = [];

const style = document.createElement('style');
style.textContent = `
ytm-pivot-bar-renderer,
ytm-search-header-renderer,
#player-control-overlay,
.ytp-chrome-bottom,
.ytp-gradient-bottom,
.ytp-layer,
ytm-promoted-sparkles-web-renderer {
display: none !important;
}

body {
background: #000 !important;
color: #fff !important;
}

#player-container-id {
background: #000 !important;
height: 56.25vw !important;
position: relative !important;
}

video#nati-tahoe-native {
position: absolute;
top: 0;
left: 0;
width: 100vw;
height: 56.25vw;
z-index: 2147483647;
background: #000;
object-fit: contain;
}

#nati-download-btn {
position: absolute;
right: 10px;
bottom: -40px;
z-index: 2147483647;
background: #D0BCFF;
color: #381E72;
border: none;
padding: 8px 16px;
border-radius: 20px;
font-weight: bold;
font-size: 12px;
}

ytm-single-column-watch-next-results-renderer {
background: #000 !important;
padding-top: 50px !important;
}

.html5-video-container {
opacity: 0 !important;
}
`;
document.documentElement.appendChild(style);

function downloadBlob() {
const blob = new Blob(recordedChunks, { type: 'video/webm' });
const url = URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = `NatiTube_Tahoe_${Date.now()}.webm`;
a.click();
recordedChunks = [];
}

function initNativeEngine() {
if (document.getElementById('nati-tahoe-native')) return;

const container = document.getElementById('player-container-id');
if (!container) return;

nativeVideo = document.createElement('video');
nativeVideo.id = 'nati-tahoe-native';
nativeVideo.controls = true;
nativeVideo.autoplay = true;
nativeVideo.playsInline = true;
const dlBtn = document.createElement('button');
dlBtn.id = 'nati-download-btn';
dlBtn.innerText = 'RECORD/STOP';
dlBtn.onclick = () => {
if (mediaRecorder && mediaRecorder.state === 'recording') {
mediaRecorder.stop();
dlBtn.style.background = '#D0BCFF';
} else if (nativeVideo.srcObject) {
recordedChunks = [];
mediaRecorder = new MediaRecorder(nativeVideo.srcObject);
mediaRecorder.ondataavailable = (e) => { if (e.data.size > 0) recordedChunks.push(e.data); };
mediaRecorder.onstop = downloadBlob;
mediaRecorder.start();
dlBtn.style.background = '#ffb4ab';
}
};

container.appendChild(nativeVideo);
container.appendChild(dlBtn);
}

function syncEngine() {
if (!location.pathname.startsWith('/watch')) {
if (nativeVideo) {
nativeVideo.srcObject = null;
nativeVideo.remove();
document.getElementById('nati-download-btn')?.remove();
nativeVideo = null;
bridgedVideo = null;
}
return;
}

initNativeEngine();
const ytVideo = document.querySelector('video.html5-main-video');
if (!ytVideo || ytVideo.readyState < 2 || !nativeVideo) return;

if (bridgedVideo !== ytVideo || location.href !== lastUrl) {
lastUrl = location.href;
const stream = ytVideo.captureStream ? ytVideo.captureStream() : ytVideo.mozCaptureStream();
nativeVideo.srcObject = stream;
bridgedVideo = ytVideo;
nativeVideo.play().catch(() => {});
}

if (Math.abs(nativeVideo.currentTime - ytVideo.currentTime) > 0.2) {
if (nativeVideo.seeking) {
ytVideo.currentTime = nativeVideo.currentTime;
} else {
nativeVideo.currentTime = ytVideo.currentTime;
}
}

if (nativeVideo.paused !== ytVideo.paused) {
nativeVideo.paused ? ytVideo.pause() : ytVideo.play();
}
}

setInterval(syncEngine, 300);
})();

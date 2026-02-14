const API_URL = "https://dinarsight.onrender.com/predict";

let currentAudio = null;
let scanning = false;

/* -------------------------
   English fallback TTS
-------------------------- */
function speakEnglish(text) {
    if (!("speechSynthesis" in window)) return;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = 0.9;
    speechSynthesis.speak(utterance);
}

/* -------------------------
   Kurdish audio with fallback
-------------------------- */
function playAudio(fileName, fallbackText = null) {
    try {
        if (currentAudio) {
            currentAudio.pause();
            currentAudio.currentTime = 0;
        }

        currentAudio = new Audio(`/static/audio/${fileName}`);
        currentAudio.play().catch(() => {
            console.warn("Kurdish audio failed, using English fallback");
            if (fallbackText) speakEnglish(fallbackText);
        });
    } catch (err) {
        console.error("Audio error:", err);
        if (fallbackText) speakEnglish(fallbackText);
    }
}

/* -------------------------
   Auto Camera Start
-------------------------- */
async function startCamera() {
    const video = document.getElementById("video");

    try {
        playAudio("camera.mp3", "Opening camera");

        const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: "environment" }
        });

        video.srcObject = stream;

        // Start scanning after 3 seconds
        setTimeout(scanFrame, 3000);

    } catch (err) {
        console.error(err);
        playAudio("error.mp3", "Camera access denied.");
    }
}

/* -------------------------
   Capture & Send Frame
-------------------------- */
async function scanFrame() {
    if (scanning) return;
    scanning = true;

    const video = document.getElementById("video");
    const canvas = document.getElementById("canvas");
    const resultText = document.getElementById("resultText");
    const confidenceText = document.getElementById("confidenceText");

    const context = canvas.getContext("2d");

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    context.drawImage(video, 0, 0);

    resultText.innerText = "Scanning...";
    confidenceText.innerText = "";

    canvas.toBlob(async (blob) => {

        const formData = new FormData();
        formData.append("image", blob);

        try {
            const response = await fetch(API_URL, {
                method: "POST",
                body: formData
            });

            if (!response.ok) {
                throw new Error("Server error");
            }

            const data = await response.json();
            const value = data.denomination.replace("IQD_", "");

            resultText.innerText = `Denomination: ${value} IQD`;
            confidenceText.innerText = `Confidence: ${data.confidence}%`;

            if (data.confidence < 70) {
                playAudio("error.mp3", "Currency could not be recognized clearly.");
            } else {
                playAudio(`${value}.mp3`, `This is ${value} Iraqi dinar`);
            }

        } catch (error) {
            console.error(error);
            playAudio("error.mp3", "Unable to reach the server.");
        }

        scanning = false;

        // Scan again after 5 seconds
        setTimeout(scanFrame, 5000);

    }, "image/jpeg");
}

/* -------------------------
   Start App Automatically
-------------------------- */
window.addEventListener("load", () => {
    startCamera();
});
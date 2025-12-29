// ✅ Relative API path (works locally, on Render, and in APK)
const API_URL = "/predict";

let currentAudio = null;

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
   Image Input Actions
-------------------------- */
function openGallery() {
    document.getElementById("imageInput").click();
    playAudio("gallery.mp3", "Opening gallery.");
}

function openCamera() {
    document.getElementById("cameraInput").click();
    playAudio("camera.mp3", "Opening camera.");
}

/* -------------------------
   Currency Recognition
-------------------------- */
async function recognizeCurrency() {
    const uploadInput = document.getElementById("imageInput");
    const cameraInput = document.getElementById("cameraInput");

    const file =
        cameraInput.files.length > 0
            ? cameraInput.files[0]
            : uploadInput.files[0];

    if (!file) {
        playAudio("error.mp3", "Please upload or capture an image.");
        return;
    }

    const resultText = document.getElementById("resultText");
    const confidenceText = document.getElementById("confidenceText");

    resultText.innerText = "Recognizing currency...";
    confidenceText.innerText = "";

    const formData = new FormData();
    formData.append("image", file);

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
            return;
        }

        playAudio(`${value}.mp3`, `This is ${value} Iraqi dinar`);

    } catch (error) {
        console.error(error);
        playAudio("error.mp3", "Unable to reach the server.");
    }
}

/* -------------------------
   Service Worker
-------------------------- */
if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
        navigator.serviceWorker
            .register("/static/service-worker.js")
            .then(() => console.log("Service Worker registered"))
            .catch(err => console.error("Service Worker failed", err));
    });
}
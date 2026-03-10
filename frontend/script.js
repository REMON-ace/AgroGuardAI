/* =========================
   SECTION CONFIG
========================= */
const sectionOrder = ["home", "plantCare", "liveDetect", "myProfile"];
let currentIndex = 0;

/* =========================
   CAMERA CONTROL
========================= */
let stream = null;

function startCamera() {
    if (stream) return;

    navigator.mediaDevices.getUserMedia({ video: true })
        .then(s => {
            stream = s;
            const video = document.getElementById("video");
            if (video) video.srcObject = stream;
        })
        .catch(() => alert("Camera access denied"));
}

function stopCamera() {
    if (!stream) return;
    stream.getTracks().forEach(t => t.stop());
    stream = null;

    const video = document.getElementById("video");
    if (video) video.srcObject = null;
}

/* =========================
   SECTION SWITCHING
========================= */
function showSection(sectionId) {
    const newIndex = sectionOrder.indexOf(sectionId);
    if (newIndex === -1) return;

    // Stop camera ONLY when leaving liveDetect
    if (sectionOrder[currentIndex] === "liveDetect" && sectionId !== "liveDetect") {
        stopCamera();
    }

    document.querySelectorAll(".page-section").forEach(sec => {
        sec.classList.remove("active");
        sec.style.display = "none";
    });

    const target = document.getElementById(sectionId);
    target.style.display = "block";
    target.classList.add("active");

    currentIndex = newIndex; 
    updateNavDots();
    updateFooter(sectionId);

    window.scrollTo({ top: 0, behavior: "smooth" });
}


document.getElementById("startCameraBtn").onclick = startCamera;
document.getElementById("stopCameraBtn").onclick = stopCamera;

/* =========================
   NAV DOTS
========================= */
function createNavDots() {
    const navDots = document.getElementById("nav-dots");
    navDots.innerHTML = "";

    sectionOrder.forEach((id, i) => {
        const dot = document.createElement("div");
        dot.className = "nav-dot";
        dot.onclick = () => showSection(id);
        navDots.appendChild(dot);
    });
}

function updateNavDots() {
    document.querySelectorAll(".nav-dot").forEach((dot, i) => {
        dot.classList.toggle("active", i === currentIndex);
    });
}

/* =========================
   ARROW KEY NAVIGATION
========================= */
document.addEventListener("keydown", e => {
    if (e.key === "ArrowRight" && currentIndex < sectionOrder.length - 1) {
        showSection(sectionOrder[currentIndex + 1]);
    }
    if (e.key === "ArrowLeft" && currentIndex > 0) {
        showSection(sectionOrder[currentIndex - 1]);
    }
});

/* =========================
   FOOTER CONTROL
========================= */
function updateFooter(sectionId) {
    const footer = document.querySelector(".footer");
    if (!footer) return;

    footer.classList.toggle("minimized", sectionId !== "home");
}

/* =========================
   INIT
========================= */
document.addEventListener("DOMContentLoaded", () => {
    createNavDots();
    showSection("home");
});

/* =========================
   STOP CAMERA ON TAB HIDE
========================= */
document.addEventListener("visibilitychange", () => {
    if (document.hidden) stopCamera();
});

const plantInfo = {
    Rice: "Rice needs standing water, warm climate, and fertile soil. Common diseases include blast and brown spot.",
    Wheat: "Wheat grows best in cool weather with moderate rainfall. Susceptible to rust and smut diseases.",
    Maize: "Maize requires full sunlight and well-drained soil. Leaf blight is common.",
    Tomato: "Tomato needs regular watering and pest control. Vulnerable to blight and leaf curl virus.",
    Potato: "Potato grows in loose soil and cool climate. Late blight is a major issue.",
    Cotton: "Cotton requires warm climate and long frost-free period. Prone to wilt and boll rot."
};

function openPlantInfo(plant) {
    document.getElementById("plantTitle").innerText = plant;
    document.getElementById("plantDetails").innerText = plantInfo[plant];
    document.getElementById("plantModal").style.display = "flex";
}

function closePlantInfo() {
    document.getElementById("plantModal").style.display = "none";
}

let authMode = "login";

function switchToRegister() {
    document.getElementById("authTitle").innerText = "Register";
    document.getElementById("authSubtitle").innerText = "Create a new account.";
    document.getElementById("authActionBtn").innerText = "Register";

    document.querySelector(".auth-toggle").innerHTML =
        `Already registered?
         <span onclick="switchToLogin()">Login</span>`;
}

function switchToLogin() {
    document.getElementById("authTitle").innerText = "Login";
    document.getElementById("authSubtitle").innerText =
        "Login to save your plant searches.";
    document.getElementById("authActionBtn").innerText = "Login";

    document.querySelector(".auth-toggle").innerHTML =
        `New user?
         <span onclick="switchToRegister()">Create account</span>`;
}
function showRegister() {
    document.getElementById("authSection").style.display = "none";
    document.getElementById("registerSection").style.display = "block";
}

function createAccount() {
    // UI-only account creation
    document.getElementById("registerSection").style.display = "none";

    // Show dashboard
    showSection("myProfile");

    // Optional: remember session
    sessionStorage.setItem("loggedIn", "true");
}

function fakeLogin() {
    // For now login directly
    document.getElementById("authSection").style.display = "none";
    showSection("myProfile");
}
document.addEventListener("DOMContentLoaded", () => {
    if (sessionStorage.getItem("loggedIn") === "true") {
        document.getElementById("authSection").style.display = "none";
        document.getElementById("registerSection").style.display = "none";
        showSection("myProfile");
    }
});


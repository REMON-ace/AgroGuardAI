function showTab(tabId) {
    document.querySelectorAll(".tab").forEach(tab => {
        tab.classList.remove("active");
    });

    document.getElementById(tabId).classList.add("active");

    if (tabId === "live") {
        startCamera();
    } else {
        stopCamera();
    }
}
window.scrollTo({ top: 0, behavior: "instant" });
// function showSection(sectionId) {
//     // Stop camera first
//     stopCamera();

//     // Hide all sections
//     document.querySelectorAll('.page-section').forEach(sec => sec.style.display = 'none');

//     // Show selected section
//     const target = document.getElementById(sectionId);
//     if (!target) return console.error("Section not found:", sectionId);
//     target.style.display = 'block';

//     // Start camera ONLY for liveDetect
//     if (sectionId === 'liveDetect') startCamera();

//     window.scrollTo(0, 0);
// }




document.addEventListener("DOMContentLoaded", () => {
    showSection("home");
});

function openPlantInfo(plant) {
    document.getElementById("plantTitle").innerText = plant;

    document.getElementById("plantDetails").innerText =
        plant + " requires proper soil, water management, disease monitoring, and preventive care. " +
        "Detailed AI-based recommendations will be shown here.";

    document.getElementById("plantModal").style.display = "flex";
}

function closePlantInfo() {
    document.getElementById("plantModal").style.display = "none";
}

let stream = null;
let cameraController = null;

function startCamera() {
    const startBtn = document.getElementById("startCameraBtn");
    const stopBtn = document.getElementById("stopCameraBtn");

    // Prevent multiple requests
    if (stream || cameraController) return;

    startBtn.disabled = true; // disable start button during request

    cameraController = new AbortController();
    const signal = cameraController.signal;

    navigator.mediaDevices.getUserMedia({ video: true, audio: false, signal })
        .then(s => {
            stream = s;
            document.getElementById("video").srcObject = stream;

            startBtn.disabled = true;
            stopBtn.disabled = false;
        })
        .catch(err => {
            console.error("Camera error:", err);
            alert("Camera permission denied or not available.");
            startBtn.disabled = false;
        })
        .finally(() => {
            cameraController = null;
        });
}

function stopCamera() {
    const startBtn = document.getElementById("startCameraBtn");
    const stopBtn = document.getElementById("stopCameraBtn");

    // Abort any pending request
    if (cameraController) {
        cameraController.abort();
        cameraController = null;
    }

    // Stop running stream
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
        stream = null;
    }

    // Reset video element
    const video = document.getElementById("video");
    if (video) video.srcObject = null;

    // Reset buttons
    if (startBtn) startBtn.disabled = false;
    if (stopBtn) stopBtn.disabled = true;
}
function createNavDots() {
    const navDots = document.getElementById("nav-dots");
    navDots.innerHTML = "";

    sectionOrder.forEach((_, index) => {
        const dot = document.createElement("div");
        dot.className = "nav-dot";
        dot.onclick = () => showSectionByIndex(index);
        navDots.appendChild(dot);
    });
}
function showSectionByIndex(index) {
    if (index < 0 || index >= sectionOrder.length) return;

    // Stop camera if leaving Live Detect
    if (sectionOrder[currentIndex] === "liveDetect" && index !== 2) {
        stopCamera();
    }

    currentIndex = index;

    document.querySelectorAll(".page-section").forEach(sec => {
        sec.style.display = "none";
        sec.classList.remove("active");
    });

    const sectionId = sectionOrder[index];
    const target = document.getElementById(sectionId);
    if (!target) return;

    target.style.display = "block";
    target.classList.add("active");

    updateActiveDot(index);

    window.scrollTo({ top: 0, behavior: "smooth" });
}


// Tab sections in order
const sections = ["home", "plantCare", "liveDetect", "myProfile"];
const navDotsContainer = document.getElementById("nav-dots");

// Clear any previous dots
navDotsContainer.innerHTML = "";

// Create one dot per section
sections.forEach(id => {
    const dot = document.createElement("div");
    dot.className = "nav-dot";
    dot.dataset.section = id;

    // On click → go to that section
    dot.addEventListener("click", () => {
        showSection(id);
    });

    navDotsContainer.appendChild(dot);
});

document.addEventListener("keydown", (e) => {
    // Get current active section index
    const currentIndex = sections.findIndex(
        sec => document.getElementById(sec).style.display !== "none"
    );
    if (currentIndex === -1) return;

    if (e.key === "ArrowRight") {
        // Next tab
        const nextIndex = (currentIndex + 1) % sections.length;
        showSection(sections[nextIndex]);
    } else if (e.key === "ArrowLeft") {
        // Previous tab
        const prevIndex = (currentIndex - 1 + sections.length) % sections.length;
        showSection(sections[prevIndex]);
    }
});


function updateDots() {
    document.querySelectorAll(".nav-dot").forEach((dot, index) => {
        dot.classList.toggle("active", index === currentIndex);
    });
}



document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight" && currentIndex < sectionOrder.length - 1) {
        showSectionByIndex(currentIndex + 1);
    }

    if (e.key === "ArrowLeft" && currentIndex > 0) {
        showSectionByIndex(currentIndex - 1);
    }
});

function updateFooter(sectionId) {
    const footer = document.querySelector(".footer");
    const sections = document.querySelectorAll(".page-section");
    if (!footer || !sections) return;

    const minHeight = 25;   // thin line height
    const maxHeight = 130;  // expanded footer height

    // Remove previous hover events
    footer.onmouseenter = null;
    footer.onmouseleave = null;

    if (sectionId === "home") {
        footer.classList.remove("minimized");
        footer.classList.add("home-section");
        sections.forEach(sec => sec.style.marginBottom = "0px");
    } else {
        footer.classList.add("minimized");
        footer.classList.remove("home-section");
        sections.forEach(sec => sec.style.marginBottom = minHeight + "px");

        // Only push content once on hover
        footer.onmouseenter = () => {
            sections.forEach(sec => sec.style.marginBottom = maxHeight + "px");
        };
        footer.onmouseleave = () => {
            sections.forEach(sec => sec.style.marginBottom = minHeight + "px");
        };
    }
}

function createNavDots() {
    const navDots = document.getElementById("nav-dots");
    navDots.innerHTML = "";
    const sections = document.querySelectorAll(".page-section");

    sections.forEach((sec, idx) => {
        const dot = document.createElement("div");
        dot.classList.add("nav-dot");
        if (sec.style.display !== "none") dot.classList.add("active");
        dot.onclick = () => showSection(sec.id);
        navDots.appendChild(dot);
    });
}

// Call after showing section
function updateNavDots() {
    const sections = document.querySelectorAll(".page-section");
    sections.forEach((sec, idx) => {
        const dot = document.querySelectorAll(".nav-dot")[idx];
        if (!dot) return;
        if (sec.style.display !== "none") dot.classList.add("active");
        else dot.classList.remove("active");
    });
}
const sectionOrder = ["home", "plantCare", "liveDetect", "myProfile"];
function createNavDots() {
    navDots.innerHTML = "";

    sectionOrder.forEach((id, index) => {
        const dot = document.createElement("div");
        dot.className = "nav-dot";
        dot.onclick = () => showSection(id);
        navDots.appendChild(dot);
    });
}

function showSection(sectionId) {
    if (sectionId !== "liveDetect") stopCamera();

    document.querySelectorAll(".page-section").forEach(sec => {
        sec.classList.remove("active");
        sec.style.display = "none";
    });

    const target = document.getElementById(sectionId);
    if (!target) return;

    target.style.display = "block";
    target.classList.add("active");
    updateFooter(sectionId);
    updateActiveDot(sectionId);

    window.scrollTo({ top: 0, behavior: "smooth" });
}
document.addEventListener("DOMContentLoaded", () => {
    createNavDots();
    showSection("home");
});

function getCurrentIndex() {
    const active = document.querySelector(".page-section.active");
    return sectionOrder.indexOf(active?.id);
}

document.addEventListener("keydown", (e) => {
    const i = getCurrentIndex();
    if (i === -1) return;

    if (e.key === "ArrowRight" && i < sectionOrder.length - 1) {
        showSection(sectionOrder[i + 1]);
    }

    if (e.key === "ArrowLeft" && i > 0) {
        showSection(sectionOrder[i - 1]);
    }
});




// Initialize first section and dot
document.addEventListener("DOMContentLoaded", () => {
    showSection("home");
});


// Init nav dots on page load
document.addEventListener("DOMContentLoaded", () => {
    createNavDots();
    showSection("home");
});

// Initial load
document.addEventListener("DOMContentLoaded", () => {
    showSection("home");
});


// Initialize on page load for the active section
document.addEventListener("DOMContentLoaded", () => {
    const activeSection = document.querySelector(".page-section:not([style*='display: none'])")?.id || "home";
    updateFooter(activeSection);
});


// Run on page load for first active section
document.addEventListener("DOMContentLoaded", () => {
    const activeSection = document.querySelector(".page-section:not([style*='display: none'])")?.id || "home";
    updateFooter(activeSection);
});


// Initialize on first load
document.addEventListener("DOMContentLoaded", () => {
    const activeSection = document.querySelector(".page-section:not([style*='display: none'])")?.id || "home";
    updateFooter(activeSection);
});

// Call updateFooter **on first page load** for the active section
document.addEventListener("DOMContentLoaded", () => {
    const activeSection = document.querySelector(".page-section:not([style*='display: none'])")?.id || "home";
    updateFooter(activeSection);
});


// // Call this inside your showSection function
// function showSection(sectionId) {
//     if (sectionId !== "liveDetect") stopCamera();

//     document.querySelectorAll(".page-section").forEach(sec => sec.style.display = "none");
//     const target = document.getElementById(sectionId);
//     if (!target) return console.error("Section not found:", sectionId);
//     target.style.display = "block";

//     window.scrollTo(0, 0);

//     updateFooter(sectionId); // Update footer behavior
// }

document.addEventListener("DOMContentLoaded", () => {
    const startBtn = document.getElementById("startCameraBtn");
    const stopBtn = document.getElementById("stopCameraBtn");

    if (startBtn) startBtn.onclick = startCamera;
    if (stopBtn) stopBtn.onclick = stopCamera;

    showSection("home"); // default section
});

// Optional: Stop camera if user switches browser tab
document.addEventListener("visibilitychange", () => {
    if (document.hidden) stopCamera();
});


function openPlantInfo(plant) {
    const details = {
        Rice: "Rice needs standing water, warm climate, and fertile soil.",
        Wheat: "Wheat grows best in cool weather with moderate rainfall.",
        Maize: "Maize needs full sunlight and well-drained soil.",
        Tomato: "Tomato requires regular watering and pest control.",
        Potato: "Potato grows underground and needs loose soil.",
        Cotton: "Cotton requires warm climate and long frost-free period."
    };

    document.getElementById("plantTitle").innerText = plant;
    document.getElementById("plantDetails").innerText = details[plant];
    document.getElementById("plantModal").style.display = "flex";
}

function closePlantInfo() {
    document.getElementById("plantModal").style.display = "none";
}


/* PLANT DATA */
let currentPlant = null;

const plantData = {
    rice: {
        name: "Rice",
        overview: "Rice is a staple cereal crop grown in flooded fields across Asia.",
        care: "Requires warm climate, clayey soil, and standing water during growth.",
        disease: "Blast disease, brown spot, sheath blight.",
        prevention: "Use resistant varieties, balanced fertilization, proper drainage."
    },
    wheat: {
        name: "Wheat",
        overview: "Wheat is one of the most widely cultivated cereal crops.",
        care: "Needs cool weather, moderate rainfall, and loamy soil.",
        disease: "Rust, smut, powdery mildew.",
        prevention: "Seed treatment, crop rotation, timely irrigation."
    },
    maize: {
        name: "Maize",
        overview: "Maize is used for food, fodder, and industrial products.",
        care: "Requires well-drained soil and full sunlight.",
        disease: "Leaf blight, stalk rot.",
        prevention: "Proper spacing, disease-resistant hybrids."
    },
    tomato: {
        name: "Tomato",
        overview: "Tomato is a widely consumed vegetable crop.",
        care: "Needs warm climate, fertile soil, and regular watering.",
        disease: "Leaf curl virus, blight.",
        prevention: "Pest control, proper irrigation, healthy seedlings."
    },
    potato: {
        name: "Potato",
        overview: "Potato is a tuber crop rich in carbohydrates.",
        care: "Cool climate, loose soil, adequate moisture.",
        disease: "Late blight, scab.",
        prevention: "Seed treatment, crop rotation, soil management."
    },
    cotton: {
        name: "Cotton",
        overview: "Cotton is a major fiber crop used in textile industries.",
        care: "Requires warm climate and black soil.",
        disease: "Wilt, boll rot.",
        prevention: "Proper drainage, pest monitoring, resistant varieties."
    }
};

function openPlant(plant) {
    currentPlant = plant;
    document.getElementById("plantName").innerText = plantData[plant].name;
    showTab('overview');
    document.getElementById("plantModal").style.display = "flex";
}

function closePlant() {
    document.getElementById("plantModal").style.display = "none";
}

function showTab(tab) {
    document.getElementById("plantContent").innerText =
        plantData[currentPlant][tab];
}

function showPlant(name) {
    document.getElementById("plant-name").innerText = name;
    document.getElementById("plant-info").innerText = plants[name].info;

    const list = document.getElementById("plant-prevention");
    list.innerHTML = "";
    plants[name].prevention.forEach(item => {
        const li = document.createElement("li");
        li.innerText = item;
        list.appendChild(li);
    });

    document.getElementById("plant-details").classList.remove("hidden");
}
const userStats = {
    plantsReviewed: 0,
    imagesUploaded: 0,
    liveDetections: 0,
    bookmarked: 0
};

function updateDashboard() {
    document.getElementById("plantsReviewed").innerText = userStats.plantsReviewed;
    document.getElementById("imagesUploaded").innerText = userStats.imagesUploaded;
    document.getElementById("liveDetections").innerText = userStats.liveDetections;
    document.getElementById("bookmarked").innerText = userStats.bookmarked;

    drawPieChart();
    updateProgress();
}
// Call once on load
updateDashboard();
function drawPieChart() {
    const canvas = document.getElementById("activityChart");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    const data = [
        userStats.plantsReviewed,
        userStats.imagesUploaded,
        userStats.liveDetections,
        userStats.bookmarked
    ];

    const labels = ["Plants", "Images", "Live", "Bookmarks"];
    const colors = ["#66bb6a", "#42a5f5", "#ffa726", "#ab47bc"];

    const total = data.reduce((a, b) => a + b, 0);

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // If all zero → show empty circle
    if (total === 0) {
        ctx.beginPath();
        ctx.arc(150, 150, 120, 0, Math.PI * 2);
        ctx.fillStyle = "#e0e0e0";
        ctx.fill();
        return;
    }

    let startAngle = 0;

    data.forEach((value, index) => {
        const sliceAngle = (value / total) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(150, 150);
        ctx.arc(150, 150, 120, startAngle, startAngle + sliceAngle);
        ctx.fillStyle = colors[index];
        ctx.fill();
        startAngle += sliceAngle;
    });
}
function updateProgress() {
    const plantProgress = Math.min(userStats.plantsReviewed * 10, 100);
    const usageProgress = Math.min(
        (userStats.imagesUploaded + userStats.liveDetections) * 10,
        100
    );

    document.getElementById("plantProgress").style.width = plantProgress + "%";
    document.getElementById("usageProgress").style.width = usageProgress + "%";
}
function logActivity(text) {
    const list = document.getElementById("activityLog");

    if (list.children[0]?.innerText === "No activity yet") {
        list.innerHTML = "";
    }

    const li = document.createElement("li");
    li.innerText = text;
    list.prepend(li);
}
document.addEventListener("DOMContentLoaded", () => {
    showSection('home');
});



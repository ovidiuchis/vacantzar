// Fallback coordinates for common locations
const fallbackCoordinates = {
  Romania: [45.9432, 24.9668],
  Croatia: [45.1, 15.2],
  Spania: [40.4168, -3.7038],
  Germania: [51.1657, 10.4515],
  Austria: [47.5162, 14.5501],
  Franta: [46.2276, 2.2137],
  Belgia: [50.5039, 4.4699],
  Budapesta: [47.4979, 19.0402],
  Ungaria: [47.1625, 19.5033],
  Italia: [41.8719, 12.5674],
  Grecia: [39.0742, 21.8243],
  Japonia: [36.2048, 138.2529],
  Elveția: [46.8182, 8.2275],
  Indonezia: [-0.7893, 113.9213],
  Islanda: [64.9631, -19.0208],
  Maroc: [31.7917, -7.0926],
  Kenya: [-0.0236, 37.9062],
  Norvegia: [60.472, 8.4689],
};

let detailMap = null;
let currentVacation = null;

// Initialize page
document.addEventListener("DOMContentLoaded", function () {
  loadVacationDetails();
});

// Get stub from URL path or hash
function getStubFromUrl() {
  // First try hash (for GitHub Pages)
  if (window.location.hash) {
    const stub = window.location.hash.substring(1); // Remove the #
    if (stub && !stub.startsWith("year-")) {
      return stub;
    }
  }

  // Then try path (for direct access)
  const path = window.location.pathname;
  const stub = path.split("/").pop();
  return stub && stub !== "detail.html" && stub !== "" ? stub : null;
}

// Load vacation details
async function loadVacationDetails() {
  const loadingElement = document.getElementById("loadingDetail");
  const errorElement = document.getElementById("errorDetail");
  const contentElement = document.getElementById("detailContent");

  try {
    // Get stub from URL
    const stub = getStubFromUrl();

    if (!stub) {
      throw new Error("No vacation stub provided");
    }

    // Load holidays data
    const response = await fetch("holidays.json");
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const holidays = await response.json();

    // Find vacation by stub
    currentVacation = holidays.find((h) => h.stub === stub);

    if (!currentVacation) {
      throw new Error("Vacation not found");
    }

    // Hide loading, show content
    loadingElement.style.display = "none";
    contentElement.style.display = "block";

    // Render vacation details
    renderVacationDetails(currentVacation);
  } catch (error) {
    console.error("Error loading vacation details:", error);
    loadingElement.style.display = "none";
    errorElement.style.display = "block";
  }
}

// Render vacation details
function renderVacationDetails(vacation) {
  // Update title and subtitle
  document.getElementById("detailTitle").textContent = vacation.title;
  document.getElementById(
    "detailSubtitle"
  ).textContent = `${vacation.month} ${vacation.year} • ${vacation.location}`;

  // Update back button
  const backButton = document.getElementById("backButton");
  const backButtonText = document.getElementById("backButtonText");
  backButtonText.textContent = `Înapoi la călătoriile din ${vacation.year}`;
  backButton.href = `index.html#year-${vacation.year}`;

  // Update page title
  document.title = `${vacation.title} - Aventurile Noastre`;

  // Render info grid
  renderInfoGrid(vacation);

  // Render links if available
  if (vacation.links && vacation.links.length > 0) {
    renderLinks(vacation.links);
  }

  // Initialize map
  initializeDetailMap(vacation);
}

// Render info grid
function renderInfoGrid(vacation) {
  const infoGrid = document.getElementById("infoGrid");
  const typeIcon = getVacationTypeIcon(vacation.type);
  const typeLabel = getVacationTypeLabel(vacation.type);
  const costClass = getCostClass(vacation.costPerDay);

  infoGrid.innerHTML = `
    <div class="info-item">
      <span class="info-label">Destinație</span>
      <span class="info-value">${vacation.location}</span>
    </div>
    <div class="info-item">
      <span class="info-label">Durată</span>
      <span class="info-value">${vacation.duration} zile</span>
    </div>
    <div class="info-item">
      <span class="info-label">Perioadă</span>
      <span class="info-value">${vacation.month} ${vacation.year}</span>
    </div>
    <div class="info-item">
      <span class="info-label">Cost pe zi</span>
      <span class="info-value">€${vacation.costPerDay}</span>
    </div>
    <div class="info-item">
      <span class="info-label">Tip călătorie</span>
      <span class="info-value">${typeIcon} ${typeLabel}</span>
    </div>
  `;
}

// Render links
function renderLinks(links) {
  const linksSection = document.getElementById("detailLinksSection");
  const linksList = document.getElementById("detailLinksList");

  linksSection.style.display = "block";

  linksList.innerHTML = links
    .map(
      (link) => `
    <a href="${link.url}" target="_blank" rel="noopener noreferrer" class="relevant-link">
      <svg class="link-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
      </svg>
      <span class="link-text">${link.title}</span>
      <svg class="external-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
        <polyline points="15 3 21 3 21 9"></polyline>
        <line x1="10" y1="14" x2="21" y2="3"></line>
      </svg>
    </a>
  `
    )
    .join("");
}

// Initialize detail map
function initializeDetailMap(vacation) {
  const mapContainer = document.getElementById("detailMap");

  if (detailMap) {
    detailMap.remove();
  }

  const coordinates = fallbackCoordinates[vacation.location] || [
    45.9432, 24.9668,
  ];

  detailMap = L.map("detailMap").setView(coordinates, 6);

  // Add tile layer
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution:
      '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 18,
  }).addTo(detailMap);

  // Add marker
  const typeIcon = getVacationTypeIcon(vacation.type);
  const markerColor = vacation.type === "family" ? "#3b82f6" : "#ec4899";
  const markerBg = vacation.type === "family" ? "#dbeafe" : "#fce7f3";

  const markerHtml = `
    <div class="custom-marker" style="
      background-color: ${markerBg};
      border: 2px solid ${markerColor};
      border-radius: 50%;
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    ">
      ${typeIcon}
    </div>
  `;

  const marker = L.marker(coordinates, {
    icon: L.divIcon({
      html: markerHtml,
      className: "custom-div-icon",
      iconSize: [40, 40],
      iconAnchor: [20, 20],
    }),
  }).addTo(detailMap);

  marker
    .bindPopup(
      `
    <div style="font-family: Inter, sans-serif;">
      <h3 style="margin: 0 0 8px 0; color: #1f2937; font-size: 16px;">
        ${typeIcon} ${vacation.title}
      </h3>
      <p style="margin: 0; color: #6b7280; font-size: 14px;">
        ${vacation.month} ${vacation.year} • ${vacation.duration} zile<br>
        €${vacation.costPerDay}/zi • €${
        vacation.costPerDay * vacation.duration
      } total
      </p>
    </div>
  `
    )
    .openPopup();
}

// Helper functions
function getVacationTypeIcon(type) {
  switch (type) {
    case "family":
      return "👨‍👩‍👧‍👦";
    case "couple":
      return "💑";
    default:
      return "✈️";
  }
}

function getVacationTypeLabel(type) {
  switch (type) {
    case "family":
      return "Familie";
    case "couple":
      return "Cuplu";
    default:
      return "Călătorie";
  }
}

function getCostClass(cost) {
  if (cost < 120) return "cost-low";
  if (cost < 220) return "cost-medium";
  return "cost-high";
}

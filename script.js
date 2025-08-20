// Global variables
let allHolidays = [];
let filteredHolidays = [];

// DOM elements
const loadingElement = document.getElementById("loading");
const timelineContainer = document.getElementById("timelineContainer");
const timelineItems = document.getElementById("timelineItems");
const noResults = document.getElementById("noResults");
const yearFilter = document.getElementById("yearFilter");

// Map-related variables
let vacationMap = null;
let mapMarkers = [];
let locationCoordinates = {};

// Fallback coordinates for common locations
const fallbackCoordinates = {
  Romania: [45.9432, 24.9668],
  Croatia: [45.1, 15.2],
  Spania: [40.4168, -3.7038],
  Germania: [51.1657, 10.4515],
  Austria: [47.5162, 14.5501],
  Germania: [48.7758, 11.4226],
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

// Initialize the application
document.addEventListener("DOMContentLoaded", function () {
  loadHolidays();
});

// Load holidays from JSON file
async function loadHolidays() {
  try {
    const response = await fetch("holidays.json");
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    // Validate data structure
    if (!Array.isArray(data) || data.length === 0) {
      throw new Error("Invalid or empty holiday data");
    }

    allHolidays = data;
    filteredHolidays = [...allHolidays];

    setupYearFilter();
    renderTimeline();
    updateStats();

    // Load coordinates and then initialize map
    loadLocationCoordinates();
    initializeMap();

    // Hide loading and show timeline
    loadingElement.style.display = "none";
    timelineContainer.style.display = "block";
  } catch (error) {
    console.error("Error loading holidays:", error);
    loadingElement.innerHTML = `
            <div style="text-align: center; color: #dc2626;">
                <h3>Eroare la încărcarea datelor</h3>
                <p>${error.message}</p>
                <button onclick="loadHolidays()" style="margin-top: 1rem; padding: 0.5rem 1rem; background: #3b82f6; color: white; border: none; border-radius: 0.375rem; cursor: pointer;">
                    Încearcă din nou
                </button>
            </div>
        `;
  }
}

// Setup year filter dropdown
function setupYearFilter() {
  const years = [...new Set(allHolidays.map((holiday) => holiday.year))].sort();
  const currentYear = new Date().getFullYear();

  // Clear existing options except "Toate anii"
  while (yearFilter.children.length > 1) {
    yearFilter.removeChild(yearFilter.lastChild);
  }

  // Add year options
  years.forEach((year) => {
    const option = document.createElement("option");
    option.value = year;
    option.textContent = year;
    yearFilter.appendChild(option);
  });

  // Set current year as default if it exists in the data
  if (years.includes(currentYear)) {
    yearFilter.value = currentYear;
    // Filter holidays to current year
    filteredHolidays = allHolidays.filter(
      (holiday) => holiday.year === currentYear
    );
  }

  // Add event listener for filter changes
  yearFilter.addEventListener("change", handleYearFilter);
}

// Handle year filter change with debouncing
let filterTimeout;
function handleYearFilter(event) {
  // Clear previous timeout
  if (filterTimeout) {
    clearTimeout(filterTimeout);
  }

  // Debounce the filter operation
  filterTimeout = setTimeout(() => {
    const selectedYear = event.target.value;

    if (selectedYear === "all") {
      filteredHolidays = [...allHolidays];
    } else {
      filteredHolidays = allHolidays.filter(
        (holiday) => holiday.year === parseInt(selectedYear)
      );
    }

    renderTimeline();
    updateStats();
    updateMapMarkers();
  }, 100);
}

// Render the timeline
function renderTimeline() {
  // Clear existing items
  timelineItems.innerHTML = "";

  if (filteredHolidays.length === 0) {
    noResults.style.display = "block";
    return;
  } else {
    noResults.style.display = "none";
  }

  // Sort holidays by year and month
  const monthOrder = {
    Ianuarie: 1,
    Februarie: 2,
    Martie: 3,
    Aprilie: 4,
    Mai: 5,
    Iunie: 6,
    Iulie: 7,
    August: 8,
    Septembrie: 9,
    Octombrie: 10,
    Noiembrie: 11,
    Decembrie: 12,
  };

  const sortedHolidays = [...filteredHolidays].sort((a, b) => {
    if (a.year !== b.year) {
      return a.year - b.year;
    }
    return monthOrder[a.month] - monthOrder[b.month];
  });

  sortedHolidays.forEach((holiday, index) => {
    const timelineItem = createTimelineItem(holiday, index);
    timelineItems.appendChild(timelineItem);
  });
}

// Get cost class based on cost per day
function getCostClass(cost) {
  if (cost < 120) return "cost-low";
  if (cost < 220) return "cost-medium";
  return "cost-high";
}

// Get vacation type icon
function getVacationTypeIcon(type) {
  switch (type) {
    case "family":
      return "👨‍👩‍👧‍👦"; // Family emoji
    case "couple":
      return "💑"; // Couple emoji
    default:
      return "✈️"; // Default travel emoji
  }
}

// Get vacation type label
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

// Create a timeline item with numbering
function createTimelineItem(holiday, index) {
  const item = document.createElement("div");
  item.className = "timeline-item";

  const costClass = getCostClass(holiday.costPerDay);
  const typeIcon = getVacationTypeIcon(holiday.type);
  const typeLabel = getVacationTypeLabel(holiday.type);

  item.innerHTML = `
        <div class="timeline-dot timeline-number">${index + 1}</div>
        <div class="timeline-card">
            <div class="card-content">
                <div class="card-main">
                    <div class="card-header">
                        <h3 class="card-title">${holiday.title}</h3>
                        <div class="header-badges">
                            <div class="month-badge">
                                <svg class="month-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                                    <line x1="16" y1="2" x2="16" y2="6"></line>
                                    <line x1="8" y1="2" x2="8" y2="6"></line>
                                    <line x1="3" y1="10" x2="21" y2="10"></line>
                                </svg>
                                <span class="month-text">${holiday.month}</span>
                            </div>
                            <div class="vacation-type ${holiday.type}">
                                <span class="type-icon">${typeIcon}</span>
                                <span class="type-label">${typeLabel}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="card-details">
                        <div class="detail-item">
                            <svg class="detail-icon" viewBox="0 0 25 25" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M20 10c0 6-10 12-10 12s-10-6-10-12a10 10 0 0 1 20 0Z"></path>
                                <circle cx="10" cy="10" r="3"></circle>
                            </svg>
                            ${holiday.location}
                        </div>
                    </div>
                    
                    <div>
                        <span class="duration-badge">${
                          holiday.duration
                        } zile</span>
                    </div>
                </div>
                <div class="card-aside">
                    <span class="cost-badge ${costClass}">
                        <span class="cost-icon">€</span>
                        ${holiday.costPerDay}/zi
                    </span>
                </div>
            </div>
        </div>
    `;
  return item;
}

// Initialize map
function initializeMap() {
  if (vacationMap) {
    vacationMap.remove();
  }

  vacationMap = L.map("vacationMap").setView([50.0, 10.0], 4);

  // Add tile layer
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution:
      '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 18,
  }).addTo(vacationMap);

  // Add markers for all vacations and fit bounds
  updateMapMarkers();
}

// Update map markers based on filtered holidays
function updateMapMarkers() {
  if (!vacationMap) return;

  // Clear existing markers
  mapMarkers.forEach((marker) => vacationMap.removeLayer(marker));
  mapMarkers = [];

  // Group holidays by location
  const locationGroups = {};
  filteredHolidays.forEach((holiday) => {
    if (!locationGroups[holiday.location]) {
      locationGroups[holiday.location] = [];
    }
    locationGroups[holiday.location].push(holiday);
  });

  // Collect all coordinates for bounds calculation
  const allCoordinates = [];

  // Create markers for each location
  Object.keys(locationGroups).forEach((location) => {
    const coordinates = locationCoordinates[location];
    if (!coordinates) {
      console.warn(`No coordinates available for location: ${location}`);
      return;
    }

    allCoordinates.push(coordinates);

    const holidays = locationGroups[location];
    const typeIcon = getVacationTypeIcon(holidays[0].type);

    // Create custom marker HTML
    const markerHtml = `
      <div class="custom-marker" style="
        background-color: ${
          holidays[0].type === "family" ? "#dbeafe" : "#fce7f3"
        };
        border: 2px solid ${
          holidays[0].type === "family" ? "#3b82f6" : "#ec4899"
        };
        border-radius: 50%;
        width: 30px;
        height: 30px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 16px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
      ">
        ${typeIcon}
      </div>
    `;

    const marker = L.marker(coordinates, {
      icon: L.divIcon({
        html: markerHtml,
        className: "custom-div-icon",
        iconSize: [30, 30],
        iconAnchor: [15, 15],
      }),
    }).addTo(vacationMap);

    // Create popup content
    const popupContent = holidays
      .map(
        (holiday) => `
      <div style="margin-bottom: 8px; padding-bottom: 8px; border-bottom: 1px solid #e5e7eb;">
        <strong>${holiday.title}</strong><br>
        <span style="color: #6b7280; font-size: 12px;">
          ${holiday.month} ${holiday.year} • ${holiday.duration} zile • €${holiday.costPerDay}/zi
        </span>
      </div>
    `
      )
      .join("");

    marker.bindPopup(`
      <div style="font-family: Inter, sans-serif;">
        <h3 style="margin: 0 0 8px 0; color: #1f2937; font-size: 14px;">
          ${typeIcon} ${location}
        </h3>
        ${popupContent}
      </div>
    `);

    mapMarkers.push(marker);
  });

  // Fit map bounds to show all markers
  if (allCoordinates.length > 0) {
    const group = new L.featureGroup(mapMarkers);
    vacationMap.fitBounds(group.getBounds().pad(0.1));
  }
}

// Get coordinates for a location using Nominatim geocoding service
async function getLocationCoordinates(location) {
  if (locationCoordinates[location]) {
    return locationCoordinates[location];
  }

  // First try fallback coordinates for instant loading
  if (fallbackCoordinates[location]) {
    console.log(`Using fallback coordinates for: ${location}`);
    locationCoordinates[location] = fallbackCoordinates[location];
    return fallbackCoordinates[location];
  }

  try {
    // Use Nominatim geocoding service (free and no API key required)
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        location
      )}&limit=1`
    );

    if (!response.ok) {
      throw new Error("Geocoding request failed");
    }

    const data = await response.json();

    if (data.length > 0) {
      const coords = [parseFloat(data[0].lat), parseFloat(data[0].lon)];
      locationCoordinates[location] = coords;
      return coords;
    } else {
      console.warn(`No coordinates found for location: ${location}`);
      return null;
    }
  } catch (error) {
    console.error(`Error geocoding location ${location}:`, error);
    return null;
  }
}

// Load all location coordinates from holidays data
async function loadLocationCoordinates() {
  // Get unique locations from holidays
  const uniqueLocations = [
    ...new Set(allHolidays.map((holiday) => holiday.location)),
  ];

  // First, load all available fallback coordinates instantly
  uniqueLocations.forEach((location) => {
    if (fallbackCoordinates[location]) {
      locationCoordinates[location] = fallbackCoordinates[location];
    }
  });

  console.log("Location coordinates loaded:", locationCoordinates);
}

// Update statistics with loading state
function updateStats() {
  const totalDestinations = document.getElementById("totalDestinations");
  const totalDays = document.getElementById("totalDays");
  const averageCost = document.getElementById("averageCost");

  // Show loading state
  [totalDestinations, totalDays, averageCost].forEach((el) => {
    if (el) el.textContent = "...";
  });

  // Calculate stats from filtered holidays
  try {
    const uniqueCountries = new Set(
      filteredHolidays.map((holiday) => holiday.location)
    ).size;
    const totalDaysCount = filteredHolidays.reduce(
      (sum, holiday) => sum + holiday.duration,
      0
    );
    const avgCost =
      filteredHolidays.length > 0
        ? Math.round(
            filteredHolidays.reduce(
              (sum, holiday) => sum + holiday.costPerDay,
              0
            ) / filteredHolidays.length
          )
        : 0;

    // Update display
    if (totalDestinations)
      totalDestinations.textContent = `${uniqueCountries} Țări`;
    if (totalDays) totalDays.textContent = `${totalDaysCount} Zile`;
    if (averageCost) averageCost.textContent = `€${avgCost}`;
  } catch (error) {
    console.error("Error updating stats:", error);
    // Reset to default values on error
    if (totalDestinations) totalDestinations.textContent = "0 Țări";
    if (totalDays) totalDays.textContent = "0 Zile";
    if (averageCost) averageCost.textContent = "€0";
  }
}

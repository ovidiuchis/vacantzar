// Global variables
let allHolidays = [];
let filteredHolidays = [];

// DOM elements
const loadingElement = document.getElementById("loading");
const timelineContainer = document.getElementById("timelineContainer");
const timelineItems = document.getElementById("timelineItems");
const noResults = document.getElementById("noResults");
const yearFilter = document.getElementById("yearFilter");

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
    const timelineItem = createTimelineItem(holiday);
    timelineItems.appendChild(timelineItem);
  });
}

// Get cost class based on cost per day
function getCostClass(cost) {
  if (cost < 120) return "cost-low";
  if (cost < 200) return "cost-medium";
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

// Create a timeline item
function createTimelineItem(holiday) {
  const item = document.createElement("div");
  item.className = "timeline-item";

  const costClass = getCostClass(holiday.costPerDay);
  const typeIcon = getVacationTypeIcon(holiday.type);
  const typeLabel = getVacationTypeLabel(holiday.type);

  item.innerHTML = `
        <div class="timeline-dot"></div>
        <div class="timeline-card">
            <div class="card-content">
                <div class="card-main">
                    <div class="card-header">
                        <h3 class="card-title">${holiday.title}</h3>
                        <div class="vacation-type">
                            <span class="type-icon">${typeIcon}</span>
                            <span class="type-label">${typeLabel}</span>
                        </div>
                    </div>
                    
                    <div class="card-details">
                        <div class="detail-item">
                            <svg class="detail-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M20 10c0 6-10 12-10 12s-10-6-10-12a10 10 0 0 1 20 0Z"></path>
                                <circle cx="12" cy="10" r="3"></circle>
                            </svg>
                            ${holiday.location}
                        </div>
                    </div>
                    
                    <div>
                        <span class="duration-badge">
                            ${holiday.duration} zile • ${holiday.month} ${holiday.year}
                        </span>
                    </div>
                </div>
                
                <div class="card-aside">
                    <div class="cost-badge ${costClass}">
                        <svg class="cost-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="12" y1="1" x2="12" y2="23"></line>
                            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                        </svg>
                        €${holiday.costPerDay}/zi
                    </div>
                </div>
            </div>
        </div>
    `;

  return item;
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

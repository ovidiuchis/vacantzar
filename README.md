# 🧳 vacantzar

A clean, responsive **single-page app (SPA)** that visualizes your family and couple holidays as a beautiful **timeline**, interactive **map**, and simple **statistics dashboard** – all from a static JSON file. No frameworks. Just HTML, CSS, and vanilla JS.

👉 **Live demo:** [ovidiuchis.github.io/vacantzar](https://ovidiuchis.github.io/vacantzar)

---

## ✨ Features

- 📆 **Timeline view**: Shows all holidays chronologically with:
  - Destination, duration (in days), and month/year
  - Cost per day, color-coded by range
  - Travel type: family 👨‍👩‍👧‍👦 or couple 💑
- 🌍 **Interactive map**: Pins each destination using Leaflet, grouped by location
- 📊 **Statistics**:
  - Unique countries visited
  - Total days travelled
  - Average cost per day (weighted by duration)
- 🔍 **Year filter**: Explore trips year-by-year via dropdown

---

## 📁 Data Format

Holidays are stored in `holidays.json` with this structure:

```json
{
  "title": "Croatia - Split Camping",
  "duration": 8,
  "month": "Iulie",
  "year": 2025,
  "costPerDay": 267,
  "location": "Croatia",
  "type": "family"
}
```

✅ Types accepted: `family` or `couple`  
✅ Dates are grouped by `month` and `year`  
✅ Location pins use fallback coordinates (no API needed)

---

## 🚀 Getting Started

1. Clone or download the repo  
2. Open `index.html` in your browser  
3. Edit `holidays.json` with your own travel data  
4. Deploy to GitHub Pages or any static host!

---

## 🛠️ Tech Stack

- 🧱 HTML5 + CSS3 (no frameworks)
- 🗺️ [Leaflet.js](https://leafletjs.com/) for interactive map
- 🧮 Vanilla JS for rendering, filtering, and statistics

---

Made with ❤️ for better travel memories.

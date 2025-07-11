# ✈️ Holiday Timeline Viewer

A simple, elegant single-page application (SPA) built with only **HTML** and **CSS**, that visualizes your past holidays from a static JSON source.

## 🧭 Features

- 📆 View a **timeline** of holidays with:
  - Destination name
  - Month & year
  - Duration in days
  - Cost per day
- 🌍 **Map view** (static placeholder) showing holiday locations
- 📊 **Statistics summary** (e.g. average cost/day, total days traveled)
- 🔍 **Filter by year** to explore holidays over time
- 💡 Clean, responsive layout – no JavaScript frameworks

## 📁 Data Source

The app uses a static `holidays.json` file that contains data like this:

```json
[
  {
    "title": "Napoli",
    "duration": 5,
    "month": "Februarie",
    "year": 2023,
    "costPerDay": 372,
    "location": "Italia",
    "type": "family"
  },
  ...
]

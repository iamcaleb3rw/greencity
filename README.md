# 🌍 Pollution Tracker

A real-time environmental reporting and visualization platform that helps communities report, monitor, and analyze pollution incidents across districts using interactive maps and structured data insights.

---

## ✨ Overview

Pollution Tracker is a geospatial dashboard that collects environmental incident reports (waste dumping, contamination, and pollution events) and visualizes them on an interactive map.

It is designed to support:
- Citizen-driven reporting of environmental issues
- Administrative monitoring of pollution hotspots
- Data-informed cleanup and response planning

Built with modern full-stack tooling and optimized for real-world scalability.

---

## 🚀 Features

### 🗺️ Interactive Map Dashboard
- Leaflet-powered map rendering
- District-level choropleth visualization
- Severity-based pollution markers
- Tooltips and detailed popups per report
- Smooth mobile-safe rendering with resize handling

### 📊 Analytics & Insights
- District-level aggregation of reports
- Average severity scoring per region
- Report density visualization
- Status-based tracking (Reported → In Progress → Cleaned Up → Archived)

### 🧾 Reporting System
- Structured pollution incident reports
- Severity classification (1–5 scale)
- Waste type categorization
- Geographic coordinate tracking
- Optional anonymity support

### 🌱 Seeded Demo Data
- 50+ realistic sample reports
- Multi-district distribution:
  - Gasabo
  - Kicukiro
  - Nyarugenge
- Randomized but realistic environmental patterns
- Ready-to-use staging dataset

---

## 🧱 Tech Stack

- **Next.js (App Router)** — Full-stack React framework
- **React Leaflet** — Interactive maps
- **PostgreSQL (Neon)** — Cloud database
- **Drizzle ORM** — Type-safe database layer
- **TypeScript** — Static typing
- **Tailwind CSS** — UI styling
- **Faker.js** — Synthetic data generation

---

## 🗂️ Database Schema

### 📌 reports

Stores environmental incident data:

- `title`
- `description`
- `wasteType`
- `severityLevel` (1–5)
- `latitude`
- `longitude`
- `districtName`
- `nearestLandmark`
- `imageUrl` (optional)
- `reportedBy`
- `status`
- `createdAt`
- `updatedAt`

---

### 📌 status_logs

Tracks lifecycle changes of reports:

- `reportId`
- `previousStatus`
- `newStatus`
- `updatedBy`
- `notes`
- `changedAt`

This ensures full auditability of report progression.

---

## 🗺️ Supported Districts

- Gasabo
- Kicukiro
- Nyarugenge

Each district is visualized using severity-based color scaling and aggregated metrics.

---

## ⚙️ Installation

### 1. Clone the repository

```bash
git clone https://github.com/your-username/pollution-tracker.git
cd pollution-tracker
```

---

### 2. Install dependencies

```bash
bun install
```

or

```bash
npm install
```

---

### 3. Configure environment variables

Create a `.env` file:

```env
DATABASE_URL=your_neon_postgres_connection_string
```

---

### 4. Run database migrations

```bash
bun run db:migrate
```

---

### 5. Seed the database

```bash
bun db/seed.ts
```

or

```bash
bun run seed
```

---

### 6. Start development server

```bash
bun run dev
```

---

## 🌱 Seeding System

The project includes a deterministic seed generator that:

- Creates 50 pollution reports
- Randomly distributes them across districts
- Assigns realistic severity levels
- Generates geospatial coordinates
- Simulates real-world reporting patterns

This allows instant demo-ready environments.

---

## 🗺️ Map System Architecture

The map layer includes:

- Automatic resize handling using `ResizeObserver`
- Leaflet `invalidateSize()` synchronization
- Choropleth district overlays
- Marker-based incident visualization
- Mobile-responsive layout adaptation

---

## 📱 Responsive Behavior

Optimized for:

- Desktop dashboards
- Tablet analytics views
- Mobile reporting interfaces

The map dynamically adapts to layout changes without rendering glitches.

---

## 🧠 Key Design Decisions

- Separation of reports and status logs for audit history
- Geo-clustering by district for performance scalability
- Seeded dataset for reproducible demos
- Strict TypeScript schema inference via Drizzle
- Decoupled map rendering for UI stability

---

## 🔮 Future Improvements

- Authentication & role-based access control
- Real-time reporting (WebSockets / SSE)
- Admin moderation dashboard
- Time-based heatmap animations
- Image upload for field reports
- Mobile-first reporting app

---

## 👨‍💻 Author

Built as a civic-tech project focused on environmental monitoring, urban cleanliness, and data-driven response systems.

---

## 📄 License

MIT — free to use, modify, and extend.

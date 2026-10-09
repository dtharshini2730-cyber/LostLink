# LOSTLINK 🚀
### AI-Powered Lost Item Journey Reconstruction for Public Transportation Networks

> **"Every Item Has a Journey."**  
> *LostLink reconstructs the probable transit journey of lost belongings by correlating witness sightings, route telemetry, timetable schedules, time-space proximity, and explainable multi-factor AI evidence.*

---

## 📌 1. The Core Problem
Conventional lost-and-found databases are static spreadsheets: they record where an item was lost and (sometimes) where it was found. However, they provide **no insight into what happened in between**.

In high-speed trains, metro systems, and interstate bus corridors:
- Passengers disembark without noticing missing belongings.
- Fellow passengers spot items in transit but have no easy way to log sightings without taking custody.
- Items travel across multiple stations and coaches before being swept by cleaners or transit police into depot custody.
- Mismatched descriptions, delayed reporting, and fragmented station desks result in low return rates (<18%).

---

## 💡 2. The LostLink Solution & Core Differentiation
LostLink reconstructs the complete **spatial-temporal journey** of an item:

$$\text{LOST REPORT} \longrightarrow \text{WITNESS OBSERVATIONS} \longrightarrow \text{ROUTE TELEMETRY} \longrightarrow \text{FOUND CUSTODY} \longrightarrow \text{AI EVIDENCE SCORE} \longrightarrow \text{STAFF VERIFICATION} \longrightarrow \text{OWNER RECOVERY}$$

### 🔑 Key Differentiators:
1. **Frictionless Witness Observations**: Passengers don't need to carry or claim found items. A quick photo, coach number, and station log adds crucial intermediate waypoints to the journey.
2. **Deterministic & Explainable Multi-Factor AI**: AI never guesses or makes black-box claims. It evaluates 6 mathematical similarity dimensions with transparent weighting.
3. **Interactive Leaflet Journey Map & Timeline**: Judges and passengers can visualize the exact travel corridor with waypoints, timestamps, and confidence ratings.
4. **Human-In-The-Loop Staff Authority**: AI assists with evidence scoring and spatial correlation; authorized transit staff make the final verification and handover decision.

---

## 🏗️ 3. System Architecture & Tech Stack

```
   ┌────────────────────────────────────────────────────────┐
   │                   LOSTLINK FRONTEND                    │
   │  React 18 • TypeScript • Vite • Tailwind CSS           │
   │  Framer Motion • Leaflet Maps • Recharts Analytics     │
   └──────────────────────────┬─────────────────────────────┘
                              │ REST APIs + JWT Auth
                              ▼
   ┌────────────────────────────────────────────────────────┐
   │                   FASTAPI BACKEND                      │
   │  FastAPI • SQLAlchemy ORM • SQLite • Pydantic v2       │
   └─────────────┬──────────────────────────┬───────────────┘
                 │                          │
                 ▼                          ▼
   ┌───────────────────────────┐ ┌──────────────────────────┐
   │    AI MATCHING ENGINE     │ │     RELATIONAL DB        │
   │ • 64-bit dHash & aHash    │ │ • Users (Roles & Auth)   │
   │ • 3D Color Histograms     │ │ • Lost & Found Records   │
   │ • NLP TF-IDF Tokenizer    │ │ • Witness Sightings      │
   │ • Haversine Geo Correlator│ │ • Evidence Chains        │
   │ • Temporal Window Scorer  │ │ • Routes & Stations      │
   └───────────────────────────┘ └──────────────────────────┘
```

---

## 🧠 4. AI Multi-Factor Scoring Pipeline

The matching engine computes a deterministic weighted score (0–100%) across 6 dimensions:

| Component | Weight | Mathematical Methodology |
| :--- | :---: | :--- |
| **Visual Similarity** | **30%** | 64-bit Difference Hash (dHash) Hamming distance + 3D normalized RGB color histogram cosine intersection. |
| **Description & Attributes** | **20%** | NLP text tokenization, stopword cleaning, TF-IDF cosine vector similarity + Brand & unique feature bonus. |
| **Time Window Plausibility** | **15%** | Evaluates $\Delta t$ between lost report, witness sightings, and found custody against transit travel schedules. |
| **Geospatial Proximity** | **15%** | Haversine great-circle distance along transit corridors and connected railway divisions. |
| **Route & Carriage Match** | **10%** | Transit vehicle matching (e.g. Train 12675 Kovai Express) and coach/seat alignment. |
| **Witness Corroboration** | **10%** | Intermediate passenger observations corroborating transit trajectory. |

---

## 👥 5. Demo Accounts & Credentials

The system automatically seeds demo accounts with realistic historical records and active investigations:

| Role | Email | Password | Primary Capabilities |
| :--- | :--- | :--- | :--- |
| **Passenger** | `passenger@lostlink.demo` | `LostLink123` | File lost reports, track reconstructed journey, receive match alerts |
| **Witness** | `witness@lostlink.demo` | `LostLink123` | Log transit sightings without taking custody |
| **Staff** | `staff@lostlink.demo` | `LostLink123` | Operational analytics, log custody items, verify/reject match claims |

*Note: Use the **"Demo Quick-Switch"** dropdown in the top navbar or the **"⚡ LOAD DEMO INVESTIGATION"** button on the landing page for instantaneous judge evaluation.*

---

## 🌟 6. The Flagship Demo Scenario (2-Minute Judge Walkthrough)

1. **Origin (6:10 PM)**: Passenger Arjun Sharma boards *Train 12675 (Kovai Express)* at **Coimbatore Junction**, placing his **Black Wildcraft Backpack** in **Coach S3 (Berth 42)**.
2. **Witness Sighting (6:25 PM)**: Witness Priya Ramanathan spots the unattended backpack on the rack near **Tiruppur** and logs an observation.
3. **Transit Staff Checkpoint (6:50 PM)**: The Travelling Ticket Examiner (TTE) inspects Coach S3 at the **Tiruppur Halt** and coordinates handoff to the destination depot.
4. **Custody Recovery (7:10 PM)**: Station staff at **Erode Junction RPF Lost & Found** secures the backpack in vault custody.
5. **AI Journey Synthesis**: LostLink automatically connects the sequence, generating a **93.8% High Confidence Match** with complete Leaflet map coordinates and evidence nodes.
6. **Staff Verification**: Officer reviews side-by-side evidence and clicks **"VERIFY & NOTIFY PASSENGER"** to authorize pickup.

---

## 🚀 7. Installation & Run Instructions (Windows)

### Prerequisites:
- Python 3.10+
- Node.js 18+ and npm

### Backend Setup:
```powershell
# Navigate to backend directory
cd backend

# Create virtual environment (optional)
python -m venv venv
.\venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start the FastAPI server
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000
```
*The backend automatically creates the SQLite database and seeds 10 Lost, 10 Found, 10 Witness reports, routes, and AI matches on initial startup.*

### Frontend Setup:
```powershell
# Navigate to frontend directory in a new terminal
cd frontend

# Install packages
npm install

# Start the Vite development server
npm run dev -- --host
```

Open your browser at `http://localhost:5173/` to experience **LostLink**.

---

## 📡 8. Key API Endpoints

- `POST /api/auth/login` - User / Staff authentication
- `POST /api/lost` - Multi-step lost report with image preprocessing
- `GET /api/lost` - Query lost reports with category, transit, and status filters
- `POST /api/witness` - Crowdsourced sighting submission & automatic correlation
- `POST /api/found` - Staff custody intake logger
- `GET /api/journey/{lost_id}` - Reconstructed journey with waypoints, timeline, and polyline coordinates
- `GET /api/ai/matches/{lost_id}` - Multi-factor similarity scores and explanations
- `POST /api/verification` - Staff official verification decision (VERIFIED / REJECTED / REQUEST_INFO)
- `GET /api/dashboard/stats` - Operational statistics and 7-day trend metrics
- `GET /api/search?q={query}` - Global real-time search across items, routes, and stations

---

## 🔮 9. Future Scope
- **IoT Transit Beacon Integration**: BLE tag tracking across smart luggage compartments.
- **Edge CCTV Sighting Nodes**: Station security camera OCR for automated luggage tag reading.
- **Cross-Agency Interoperability**: Standardized transit API exchange between Indian Railways (IRCTC), State Transport Corporations (KSRTC/MTC), and Metro rail systems.

---


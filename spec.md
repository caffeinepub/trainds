# Trainds — Intelligent Mumbai Suburban Train Assistant

## Current State
New project. Empty Motoko backend (`src/backend/main.mo`) and scaffolded React frontend. No existing application logic.

## Requested Changes (Diff)

### Add
- Full authentication system: sign up, login, logout with role-based access (User / Admin)
- ML-based delay prediction engine (simulated Random Forest) with features: rainfall, temperature, peak_hour, train_type, line, distance, time_of_day, day_of_week → predicted_delay_minutes + MAE/R² display
- OpenWeather API HTTP outcall for live Mumbai weather (rainfall, temperature)
- Journey Planner: source + destination → predicted delay, adjusted arrival time, TPSI score, fast/slow recommendation, best departure time
- Live train simulation: next trains, ETA, platform, network status (Normal/Moderate/Severe)
- TPSI (Train Performance Score Index): reliability per route/line, trend, ranking
- SOS/Emergency system: prominent SOS button, captures geolocation + message + timestamp, stored in backend, admin can view/resolve/respond
- Smart user features: Daily Commute Alert (save route + time, flag delays), "Should I leave now?", Travel Buffer, Best Time suggestion, Delay Cause explanation, Community Incident Reporting, Personalized dashboard
- Feedback system: star rating + comment, admin view
- Admin analytics dashboard: TPSI per line, delay trends chart, peak vs off-peak, top delay causes, SOS panel, feedback overview
- Dark/Light mode toggle
- Fully mobile responsive layout with smooth animations
- Realistic Mumbai suburban train dataset (stations, routes, Western/Central/Harbour lines)

### Modify
- `src/backend/main.mo`: implement all backend logic with stable storage
- `src/frontend/`: build complete React + TypeScript + Tailwind frontend

### Remove
- Nothing (new project)

## Implementation Plan

### Backend (Motoko)
1. User management: register, login (password hashing via SHA256 simulation), session tokens, roles (user/admin)
2. SOS reports: submit (location, message, timestamp), list all (admin), mark resolved, respond
3. Feedback: submit (rating, comment), list all (admin)
4. Commute alerts: save route+time per user, retrieve
5. Community incidents: submit, list recent
6. ML prediction: pure Motoko function implementing regression tree weights for delay prediction
7. TPSI calculation: per line and per route, stored + computed from historical simulation data
8. Journey queries: store and retrieve journey history per user
9. Weather outcall: HTTP GET to OpenWeather API for Mumbai weather
10. Admin functions: view SOS, view feedback, update SOS status, get analytics data
11. All data in stable vars (stable HashMap/Array)

### Frontend (React + TypeScript + Tailwind)
1. Auth pages: Login, Register with role detection
2. User dashboard: personalized summary, TPSI widget, commute alert status, quick actions
3. Journey Planner page: station selector, prediction output, recommendations
4. Live Trains page: next trains list, ETA, platform, network status banner
5. Delay Predictor page: ML form inputs, predicted delay output, weather widget, model accuracy
6. TPSI page: per-line scores, route ranking table, trend indicators
7. SOS page: prominent emergency button, form with geolocation capture
8. Community page: incident report form, recent incidents feed
9. Smart Features page: "Should I leave now?", buffer recommendation, best time
10. Feedback page: star rating form
11. Admin dashboard: analytics charts, SOS panel, feedback list, user management
12. Dark/Light mode, smooth transitions, fully responsive

### Data
- Mumbai stations dataset: Western (Churchgate→Virar ~50 stations), Central (CSMT→Kasara/Khopoli), Harbour (CSMT→Panvel)
- Simulated TPSI scores and delay history per line
- Realistic peak hours: 8-10am, 6-9pm weekdays

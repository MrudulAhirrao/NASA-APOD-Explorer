#  NASA APOD Explorer (Cosmic Archives)

**A High-Performance, Full-Stack Infinite Scroll Gallery for NASA's Astronomy Picture of the Day.**

![Project Banner](https://img.shields.io/badge/Status-Production_Ready-success?style=for-the-badge)
![Tech Stack](https://img.shields.io/badge/Stack-Spring_Boot_%7C_React_%7C_Redis-blue?style=for-the-badge)

## Overview

This application is a modern, resilient interface for exploring the universe. It ingests data from NASA's API, caches it for high performance, and presents it in a "Glassmorphism" UI with infinite scrolling capabilities.

It features a **"Self-Healing" Architecture**: If the NASA API rate limit is exceeded, the system automatically degrades gracefully to a "Mock Mode," serving cached fallback data so the UI never crashes.

## Key Features

* ** Infinite Time Travel:** Scroll backward in time seamlessly. The system intelligently paginates through history without date overlaps.
* ** Circuit Breaker Pattern:** Automatically detects API failures (429/500) and switches to a safe fallback mode.
* ** Smart Caching (Redis):** Stores API responses to minimize latency and protect API quota.
* ** Cosmic UI:** Custom-built "Glass" interface with blurs, gradients, and a responsive layout that works on mobile and desktop.
* ** Date-Aware Filtering:** Search specifically for cosmic events by title or description.

## Architecture

<img width="1584" height="514" alt="image" src="https://github.com/user-attachments/assets/08da46c8-e46a-482d-8107-34ffe9451350" />


**Frontend (Client):**
* **Framework:** React 18 + Vite (TypeScript)
* **State Management:** TanStack Query (React Query) v5
* **Styling:** Tailwind CSS + Shadcn UI
* **Logic:** Cursor-based Pagination for non-overlapping infinite scroll.

**Backend (Server):**
* **Core:** Java 21 + Spring Boot 3.2
* **Data Binding:** DTO Pattern (Optimistic Parameter Mapping)
* **Caching:** Redis (Spring Data Redis)
* **Resilience:** Custom Fallback Logic & Error Handling

---

## Setup & Installation

### Prerequisites
* Java 17 or higher
* Node.js 18 or higher
* Redis (running locally or via Docker)
* A NASA API Key (Get one at [api.nasa.gov](https://api.nasa.gov))

### 1. Clone the Repository
```bash
git clone [https://github.com/MrudulAhirrao/NASA-APOD-Explorer.git](https://github.com/MrudulAhirrao/NASA-APOD-Explorer.git)
cd NASA-APOD-Explorer
```
## 2. Backend Setup
```bash
cd backend
# Create/Edit application.properties
# Set: nasa.api.key=YOUR_KEY
# Set: spring.data.redis.host=localhost
```
### Run the server:
```bash
mvn spring-boot:run
```
### Server will start on http://localhost:8080
---
## 3. Frontend Setup
```bash
cd frontend
npm install
```
### Start the UI
```bash
npm run dev
```
### App will start on http://localhost:5173 
---
## Deployment Guide
### Backend (Render)Dockerize: Uses the provided Dockerfile.
    - Environment Variables:NASA_API_KEY: Your real key.
        - PORT: 8080.
    - Deploy: Push to main branch.
### Frontend (Vercel)Root Directory: frontend.
    - Build Command: vite build.
    - Environment Variables:VITE_API_URL: The URL of your deployed Backend.
---
## API Reference
## 5. API Reference

| Method | Endpoint           | Description                                         |
|--------|------------------|-----------------------------------------------------|
| GET    | /api/v1/apod       | Get today's image or a specific date (`?date=YYYY-MM-DD`). |
| GET    | /api/v1/apod/range | Get a list of images. Accepts `start_date` and `end_date` params. |

---

## Contributing
 1. Fork the Project
    - Create your Feature Branch (git checkout -b feature/AmazingFeature)
    - Commit your Changes (git commit -m 'Add some AmazingFeature')
    - Push to the Branch (git push origin feature/AmazingFeature)
    - Open a Pull Request
---
### Final Step: Save and Push
Once you paste this in:

```bash
git add README.md
git commit -m "Update README to final version"
git push origin main
```
---
Now your documentation is as perfect as your code. 🌟


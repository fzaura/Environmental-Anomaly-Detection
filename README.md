# Environmental Anomaly Detection

This project combines a scalable telemetry backend (NestJS/TypeScript) with a machine learning module (Python/Isolation Forest) for detecting and reporting atmospheric anomalies based on environmental sensor data.

---

## Overview

- **Backend** (`data-pipeline/`): Ingests and stores telemetry data from environmental sensors, supports streaming live data from OpenAQ and seeding historical datasets, and exposes APIs for anomaly management.
- **AI Module** (`ai-module/`): Jupyter notebooks and Python scripts for end-to-end anomaly detection using an Isolation Forest model on curated and engineered environmental features.

---

## Key Components

### 1. Data Pipeline (NestJS Backend)
- **Ingestion & Processing**: 
  - Collects sensor data (e.g., SO2, CO, O3, PM2.5, temperature, humidity).
  - Integrates with <a href="https://openaq.org/">OpenAQ</a> for real-world atmospheric readings.
  - Stores and aggregates structured telemetry in a database via Prisma ORM.

- **Real-time Actions**: 
  - WebSocket gateway for live event streaming.
  - Scheduled background jobs to fetch new data hourly.

- **APIs**:
  - `/openaq/test-live` – Triggers live fetch from OpenAQ.
  - `/openaq/seed` – Seeds historical sensor data for training/testing.

### 2. AI Module (Python)
- **Feature Engineering**: 
  - Jupyter Notebooks for loading, cleaning, and transforming telemetry data.
  - Extracts time-based features (hour, day of week, month) and sensor correlations.

- **Anomaly Detection**: 
  - Isolation Forest algorithm trained on selected features such as CO, temperature, humidity, and engineered proxies.
  - Model flags outliers as anomalies—no labeled data required.

- **Reporting**: 
  - Detected anomalies posted back to the backend for user notification and database recording.

---

## Example Data Columns

- `station_id`, `created_at`, `latitude`, `CO`, `temperature`, `humidity`, `Absolute_Humidity_Proxy`, `CO_to_Temp_Ratio`, `hour_of_the_day`, `anomalyScore`, `is_anomaly`, etc.

---

## Getting Started

### Backend

```bash
cd data-pipeline
npm install
# Development
npm run start
# Or with file watching
npm run start:dev
```

Environment variables are managed via NestJS best practices—add your DB and API keys to `.env`.

### AI Module

Run/modify the notebooks in `ai-module/`. Ensure Python 3 and dependencies (`requirements.txt` or environment.yml) are installed.

---

## Data Flow Diagram

1. Fetch data from OpenAQ → 
2. Store in backend DB →
3. Analyze in AI module →
4. Flag & report anomalies → 
5. Notify users & update DB

---

## Contributing

Pull requests, issues, and suggestions are welcome.

---

## License

MIT

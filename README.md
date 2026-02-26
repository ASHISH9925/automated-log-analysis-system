# Automated Log Analysis System

An advanced, AI-driven SaaS platform designed to ingest, parse, and monitor application logs at scale. The system provides real-time alerting, dynamic visualizations, and a state-of-the-art **RAG (Retrieval-Augmented Generation) AI assistant** to interactively diagnose anomalies in your logs.

## 🚀 The SaaS Architecture

We developed this platform as a complete multi-tenant Software-as-a-Service, focusing on security, performance, and user experience.

- **Multi-tenant Core & Authentication**: Users register safely via JWT-based auth. Every log uploaded is isolated using secure UUIDv4 project mappings, completely preventing URL enumeration and data bleed.
- **Data Ingestion & Parsing**: The backend efficiently processes uploaded `.log` files, running regex-based parsing to extract timestamps, services, severities (INFO/WARN/ERROR/DEBUG), and message content. It handles upserts natively to avoid duplicates.
- **Vector Search & AI RAG Pipeline**: 
  - Parsed logs and high-severity alerts are vectorized using Hugging Face embedding models.
  - Embeddings are pushed into **MongoDB Atlas Vector Search**, enabling lightning-fast semantic querying.
  - A generative Hugging Face LLM acts as the "AI Log Assistant", allowing users to ask natural language questions (e.g., *"Why did my database connections timeout?"*) and receiving context-aware, Markdown-rendered diagnoses based purely on their own uploaded project data.
- **Deterministic Alert Engine**: The system continuously evaluates incoming logs across rolling time windows. If certain thresholds are reached (e.g., "6 ERROR logs within 10 minutes" or specific "404 keywords"), it automatically triggers and persists alerts with calculated severities (HIGH, MEDIUM, LOW).

## 🛠 Tech Stack

### Frontend (Client-side)
- **Framework**: React with Vite
- **Routing**: `@tanstack/react-router` for robust, type-safe file-based routing.
- **Styling & UI**: Tailwind CSS for rapid styling, featuring premium "glassmorphic" aesthetics, dynamic gradients, and animated components. `lucide-react` for iconography.
- **Data Visualization**: `recharts` to render real-time Line charts (Log Volume over time) and Pie charts (Logs by level).
- **Markdown Rendering**: `react-markdown` to natively render complex, structured responses from the AI Assistant.

### Backend (Server-side)
- **Framework**: Python / Flask, utilizing modern `uv` dependency management and virtual environments.
- **Database**: MongoDB (via `pymongo`) handling document storage, upserts, and advanced compound indexes (user + project + filename) to maintain tight data integrity. 
- **AI Integrations**: `huggingface_hub.InferenceClient` for fast text-generation and embeddings integration.
- **Security**: Granular `@require_auth` decorators and JWT payload validations securing every API route.

## ✨ Key Features

1. **Intelligent Project Dashboard**: 
   A high-end interface summarizing log entries, active alerts by severity, and time-series log volume charts.
2. **Conversational AI Log Assistant**: 
   A chat panel directly embedded in the dashboard. The RAG architecture intercepts user questions, retrieves the most mathematically relevant alerts via Vector Search, and streams a conversational, highly accurate response.
3. **Log Explorer**: 
   A dedicated `/project-logs` interface where developers can comb through raw parsed data. Includes deep-dive filtering via Keywords, Severity Levels, and specific uploaded log files.
4. **Resilient Data Processing**: 
   Re-uploading the same file gracefully overwrites old data without duplicating, thanks to intelligent backend UPSERT operations.

## 🔧 Getting Started

### Prerequisites
- Python 3.10+
- Node.js & npm
- MongoDB (Atlas recommended if using Vector Search features)
- Hugging Face API Token

### Setup the Backend
1. Navigate to the `/backend` directory.
2. Ensure your `.env` contains:
   ```env
   MONGODB_URI=your_mongo_uri
   MONGODB_DB=your_db_name
   JWT_SECRET=your_jwt_secret
   HF_TOKEN=your_huggingface_token
   HF_EMBEDDING_MODEL=your_embedding_model  # e.g., sentence-transformers/all-MiniLM-L6-v2
   HF_CHAT_MODEL=your_chat_model            # e.g., meta-llama/Llama-3-8b-chat
   ```
3. Run the development server using `uv`:
   ```bash
   uv run main.py
   ```

### Setup the Frontend
1. Navigate to the `/frontend` directory.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
4. Access the client at `http://localhost:3000`.

---
*Built focusing on modern aesthetics, solid multi-tenant security, and bleeding-edge RAG infrastructure.*

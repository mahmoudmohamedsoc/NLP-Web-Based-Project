# AI-Powered NLP Summarizer Studio 🔮

A professional, production-ready full-stack application for text summarization. This tool leverages both extractive (TF-IDF) and abstractive (BART-based Neural Network) models to provide high-quality document synthesis with real-time performance metrics.

## ✨ Features

- **Dual-Engine Summarization**:
  - **Extractive (TF-IDF)**: Rapidly identifies and extracts the most important sentences from the source text.
  - **Abstractive (BART + LoRA)**: Synthesizes a human-like summary by understanding context and rewriting condensed versions.
- **Side-by-Side Comparison**: Evaluate both models simultaneously to choose the best summary for your needs.
- **Performance Dashboard**: Real-time tracking of generation time, compression ratio, and token efficiency.
- **Premium Glassmorphic UI**: A modern, sleek design built with React and Tailwind CSS.
- **Production-Ready**: Fully containerized with Docker and optimized for platforms like Railway and Vercel.

## 🛠️ Tech Stack

- **Backend**: FastAPI, Python, Hugging Face Transformers, NLTK, Scikit-Learn.
- **AI/ML**: BART (Fine-tuned via LoRA/PEFT), TF-IDF.
- **Frontend**: React, Tailwind CSS (Custom SVGs, Glassmorphism).
- **Deployment**: Docker, Railway.

## 🚀 Getting Started

### Prerequisites
- Python 3.10+
- Node.js 18+
- Docker (optional for local containerization)

### Local Development

1. **Backend**:
   ```bash
   pip install -r requirements.txt
   python main_api.py
   ```

2. **Frontend**:
   ```bash
   cd nlp-frontend
   npm install
   npm run dev
   ```

3. **Environment**:
   Copy `nlp-frontend/.env.example` to `nlp-frontend/.env` and set your `VITE_API_URL`.

## 📦 Deployment

Check the [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for detailed instructions on deploying to Railway and Vercel.

## 📄 License

MIT

# Use an official Python runtime as a parent image
FROM python:3.10-slim

# Set environment variables (Updated to key=value format)
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV HF_HOME=/app/huggingface_cache

# Set work directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    curl \
    unzip \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy project
COPY . .

# Ensure models directory exists
RUN mkdir -p models/

# Expose port (Railway will provide the $PORT env var)
EXPOSE 8000

# Command to run the application (Updated to JSON array format)
CMD ["sh", "-c", "uvicorn main_api:app --host 0.0.0.0 --port ${PORT:-8000}"]

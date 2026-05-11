# Use an official Python runtime as a parent image
FROM python:3.10-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1
ENV HF_HOME /app/huggingface_cache

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

# Unzip model weights into the models directory
RUN unzip -o summarizer_model_v3.zip -d models/ && \
    rm summarizer_model_v3.zip

# Expose port (Railway will provide the $PORT env var)
EXPOSE 8000

# Command to run the application using $PORT
CMD uvicorn main_api:app --host 0.0.0.0 --port ${PORT:-8000}

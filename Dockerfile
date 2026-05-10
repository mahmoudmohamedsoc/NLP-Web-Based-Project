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
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy project
COPY . .

# Unzip model weights if they exist (or they might be part of the repo)
# If summarizer_model_v2.zip is in the root:
# RUN unzip summarizer_model_v2.zip -d models/bart_weights/

# Expose port
EXPOSE 8000

# Command to run the application
CMD ["uvicorn", "main_api:app", "--host", "0.0.0.0", "--port", "8000"]

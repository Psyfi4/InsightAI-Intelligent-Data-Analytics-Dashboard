# Python 3.11 slim image for a small footprint
FROM python:3.11-slim

WORKDIR /app

# Install dependencies first (cached layer unless requirements.txt changes)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy source code
COPY . .

# Generate sample data if not already present
RUN python generate_data.py

# Expose FastAPI port
EXPOSE 8000

# Start the API server with hot-reload disabled in production
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]

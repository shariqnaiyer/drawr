# drawr backend — FastAPI + build123d (OpenCascade).
# OCP is a large native library, so this image is necessarily ~1GB; it runs on a
# container host (Render/Fly/Cloud Run), not on serverless functions.
FROM python:3.12-slim

# System libraries required by OCP / OpenCascade at import + render time.
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgl1 \
    libglu1-mesa \
    libxext6 \
    libxrender1 \
    libsm6 \
    libice6 \
    libx11-6 \
    libxi6 \
    libfontconfig1 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install Python deps first so they cache across code changes.
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app ./app

# Render (and most hosts) inject $PORT; default to 8000 locally.
ENV PORT=8000
EXPOSE 8000

# Single worker: each CAD build is CPU-bound and memory-heavy. Scale with
# replicas rather than workers on small instances.
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT} --workers 1"]

# History Panel API

A FastAPI backend service for tracking and analyzing web page visits. This API provides endpoints for recording page visits and retrieving analytics about visited pages.

## Quick Start with Docker

1. Create a `.env` file using the sample file `.env.example`

2. Build and run with Docker Compose:

```bash
docker-compose up --build
```

The API will be available at `http://localhost:8000`

## Manual Setup

### Prerequisites

- Python 3.13+
- PostgreSQL 12+

### Environment Variables

Create a `.env` file using the sample file `.env.example`:

### Installation

```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start server
uvicorn app.main:app --reload
```

## API Documentation

- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Testing

```bash
# Run tests
pytest

# Run tests with coverage
pytest --cov=app
```

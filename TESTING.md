# Testing Guide

## Backend

1. Install Python dependencies

```bash
pip install -r requirements.txt
```

2. Run unit tests

```bash
pytest
```

The tests use an in-memory SQLite database and the Flask application defined in `backend/app.py`.

## Frontend

1. Install Node dependencies

```bash
cd frontend && npm install
```

2. Run frontend unit tests

```bash
npm test
```

Vitest and React Testing Library are used for frontend tests.

## Continuous Integration

A GitHub Actions workflow (`.github/workflows/ci.yml`) installs dependencies for both backend and frontend and runs the test suites.

# Testing Documentation

This directory contains tests for the FastAPI application. The tests are written using pytest and follow these best practices:

## Test Structure

- `conftest.py`: Contains shared fixtures and test configuration
- `test_*.py`: Individual test files for different components

## Running Tests

To run the tests, use the following command from the `api` directory:

```bash
pytest
```

To run tests with coverage report:

```bash
pytest --cov=app --cov-report=term-missing
```

## Fixtures

Common fixtures are defined in `conftest.py`:

- `test_db`: Provides a test database session
- `client`: Provides a test client for making HTTP requests

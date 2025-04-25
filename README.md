# History Panel Project

A Chrome extension with a backend API for tracking and analyzing web page visits. The project consists of two main components:

## Components

### 1. History Panel API (Backend)

A FastAPI service that provides endpoints for recording page visits and retrieving analytics.

**Features:**

- Track page visits
- Analyze page metrics
- Store visit history
- RESTful API endpoints

For detailed setup and development instructions, see [API README](api/README.md).

### 2. History Panel Sidebar (Chrome Extension)

A Chrome extension that provides a convenient sidebar panel for browsing and managing browser history.

**Features:**

- Quick access to browsing history in a sidebar panel
- View page metrics and previous visits
- Real-time tracking of page visits

For detailed setup and development instructions, see [Extension README](browser-extension/README.md).

## Quick Start

1. Set up the API:

   ```bash
   cd api
   # Follow instructions in api/README.md
   ```

2. Set up the Chrome extension:
   ```bash
   cd browser-extension
   # Follow instructions in browser-extension/README.md
   ```

## Development

Both components have their own development workflows and testing procedures. Please refer to their respective READMEs for detailed information:

- [API Development Guide](api/README.md)
- [Extension Development Guide](browser-extension/README.md)

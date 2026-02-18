"""
Run this file instead of calling uvicorn directly.
It ensures the backend directory is on sys.path so all
absolute imports (services.*, routes.*, etc.) resolve correctly.

Usage:
    python run.py
"""
import sys
import os

# Make sure 'backend/' is on the path
sys.path.insert(0, os.path.dirname(__file__))

import uvicorn

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
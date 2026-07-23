import os
import sys

# Add the project root directory to sys.path so Vercel can find the backend folder
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Import the FastAPI app
from backend.app.main import app as main_app

# Explicitly assign it to a top-level variable named 'app' so Vercel's static analyzer detects it
app = main_app

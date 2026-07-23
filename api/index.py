import os
import sys
import traceback

# Add the project root directory to sys.path so Vercel can find the backend folder
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

try:
    # Import the FastAPI app
    from backend.app.main import app
except Exception as e:
    # If it fails, create a minimal fallback app that renders the python traceback in the browser
    from fastapi import FastAPI
    from fastapi.responses import HTMLResponse
    
    app = FastAPI()
    error_traceback = traceback.format_exc()
    
    @app.api_route("/{path:path}", methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD", "PATCH"])
    async def fallback_route(path: str):
        html_content = f"""
        <html>
            <head><title>Startup Error Details</title></head>
            <body style="font-family: monospace; padding: 30px; background-color: #fff5f5; color: #c53030; line-height: 1.5;">
                <h1 style="border-bottom: 2px solid #feb2b2; padding-bottom: 10px; margin-bottom: 20px;">Python Startup Error</h1>
                <p>The serverless function failed to boot. Here is the full error trace:</p>
                <pre style="background: #fff; border: 1px solid #fed7d7; padding: 20px; border-radius: 5px; overflow-x: auto; box-shadow: inset 0 2px 4px rgba(0,0,0,0.05); font-size: 14px;">{error_traceback}</pre>
            </body>
        </html>
        """
        return HTMLResponse(content=html_content, status_code=500)

"""
Aff Video Gen - Web API Backend
FastAPI application for AI video generation
"""
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import logging

# Load environment variables FIRST
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialize database on startup"""
    from core.database import init_db
    await init_db()
    logging.info("Database initialized")
    yield


# Create FastAPI app
app = FastAPI(
    title="Aff Video Gen API",
    description="AI Video Generation API for affiliate marketing content",
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# Configure CORS for web frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",      # Next.js dev
        "http://127.0.0.1:3000",
        "http://localhost:5173",      # Vite dev
        "http://127.0.0.1:5173",
        "*"                           # Allow all for development
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Import and register routes
from routes.upload import router as upload_router
from routes.generate import router as generate_router
from routes.status import router as status_router
from routes.auth import router as auth_router
from routes.admin import router as admin_router
from routes.user import router as user_router

app.include_router(auth_router)
app.include_router(admin_router)
app.include_router(user_router)
app.include_router(upload_router)
app.include_router(generate_router)
app.include_router(status_router)


@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "status": "ok",
        "app": "Aff Video Gen API",
        "version": "2.0.0"
    }


@app.get("/health")
async def health_check():
    """Health check for deployment monitoring"""
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

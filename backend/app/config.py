import os

class Config:
    PROJECT_NAME: str = "Pratyaksh AI-Powered MPLADS Monitoring"
    VERSION: str = "1.0.0"
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    DATABASE_URL: str = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/pratyaksh_db")
    CORS_ORIGINS: list = os.getenv("CORS_ORIGINS", "*").split(",")

config = Config()

import os

class Config:
    PROJECT_NAME: str = "Pratyaksh AI-Powered MPLADS Monitoring"
    VERSION: str = "1.0.0"
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    DATABASE_URL: str = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/pratyaksh_db")
    
    # CORS Configuration
    raw_cors = os.getenv("CORS_ORIGINS", "")
    if raw_cors:
        CORS_ORIGINS: list = [o.strip() for o in raw_cors.split(",") if o.strip()]
    elif ENVIRONMENT == "production":
        CORS_ORIGINS: list = ["https://pratyaksh-mplads.gov.in", "https://pratyaksh-mplads.vercel.app"]
    else:
        CORS_ORIGINS: list = ["*"]
    
    # JWT & Authentication Security Configuration
    _raw_secret = os.getenv("JWT_SECRET_KEY")
    DEFAULT_DEV_SECRET: str = "pratyaksh_dev_jwt_secret_key_change_in_production_2026"
    
    if ENVIRONMENT == "production" and (not _raw_secret or _raw_secret == DEFAULT_DEV_SECRET):
        raise ValueError("FATAL SECURITY ERROR: Default or missing JWT_SECRET_KEY in production environment. A strong secret must be configured.")

    JWT_SECRET_KEY: str = _raw_secret if _raw_secret else DEFAULT_DEV_SECRET
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440")) # 24h
    REFRESH_TOKEN_EXPIRE_DAYS: int = int(os.getenv("REFRESH_TOKEN_EXPIRE_DAYS", "7"))

config = Config()

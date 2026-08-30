from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "TechAssist AI"
    DATABASE_URL: str = "sqlite:///./techassist.db"
    VECTOR_DB_PATH: str = "./chroma_db"
    GEMINI_API_KEY: str = ""
    CONFIDENCE_THRESHOLD: float = 0.70
    TOP_K: int = 5

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
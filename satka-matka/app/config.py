from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    MONGO_URI: str = "mongodb+srv://infozodex_db:%40Zodex0@zodex.h0qhx59.mongodb.net/satkamatka?retryWrites=true&w=majority"
    JWT_SECRET: str = "changeme-please-set-in-env"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60*24*7
    WATCHPAYS_BASE_URL: str = "https://api.watchpays.com"
    WATCHPAYS_MERCHANT_ID: str = "100555332"
    WATCHPAYS_PAYIN_API_KEY: str = "7aa2fa8c2f7f9cd34e6054463bdedcfd"
    WATCHPAYS_CALLBACK_URL: str = "http://127.0.0.1:8000/payment/watchpays/callback"
    CORS_ORIGINS: str = "https://game.natraj777.com,http://localhost:5173,http://127.0.0.1:5173"

    class Config:
        env_file = ".env"

settings = Settings()

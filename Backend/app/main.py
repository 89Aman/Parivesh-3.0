from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.api.v1 import auth, admin, pp, scrutiny, mom, metadata

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Parivesh — Environmental Clearance Workflow Backend",
    version="1.0.0",
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(admin.router, prefix=settings.API_V1_STR)
app.include_router(pp.router, prefix=settings.API_V1_STR)
app.include_router(scrutiny.router, prefix=settings.API_V1_STR)
app.include_router(mom.router, prefix=settings.API_V1_STR)
app.include_router(metadata.router, prefix=settings.API_V1_STR)


@app.get("/")
async def root():
    return {"message": "Parivesh API is running", "docs": "/docs"}


@app.get("/health")
async def health_check():
    return {"status": "ok"}

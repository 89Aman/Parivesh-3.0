from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import ResponseValidationError
import traceback
from app.core.config import settings
from app.api.v1 import auth, admin, pp, scrutiny, mom, metadata

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Parivesh — Environmental Clearance Workflow Backend",
    version="1.0.0",
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
)

@app.exception_handler(ResponseValidationError)
async def validation_exception_handler(request: Request, exc: ResponseValidationError):
    return JSONResponse(
        status_code=500,
        content={"detail": "Response Validation Error", "errors": exc.errors()},
    )


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    err = traceback.format_exc()
    print(err)
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal Server Error", "traceback": err},
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

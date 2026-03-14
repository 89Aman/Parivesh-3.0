from time import perf_counter
from pathlib import Path

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.exceptions import ResponseValidationError
from sqlalchemy import text
import traceback
from app.core.config import get_cors_origins, settings
from app.core.db import engine
from app.core.latency_metrics import EndpointLatencyMetrics
from app.api.v1 import auth, admin, pp, scrutiny, mom, metadata
from app.api.v1 import ai_assist, analytics, search, notifications, compliance

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Parivesh — Environmental Clearance Workflow Backend",
    version="1.0.0",
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
)

BASE_DIR = Path(__file__).resolve().parent.parent
FRONTEND_DIST_DIR = BASE_DIR / "frontend_dist"
FRONTEND_INDEX_FILE = FRONTEND_DIST_DIR / "index.html"

latency_metrics = EndpointLatencyMetrics(
    enabled=settings.LATENCY_METRICS_ENABLED,
    window_size=settings.LATENCY_METRICS_WINDOW_SIZE,
    log_every=settings.LATENCY_METRICS_LOG_EVERY,
)


@app.middleware("http")
async def latency_metrics_middleware(request: Request, call_next):
    start = perf_counter()
    status_code = 500
    try:
        response = await call_next(request)
        status_code = response.status_code
        return response
    finally:
        elapsed_ms = (perf_counter() - start) * 1000
        route = request.scope.get("route")
        route_path = getattr(route, "path", request.url.path)
        await latency_metrics.record(
            method=request.method,
            path=route_path,
            status_code=status_code,
            duration_ms=elapsed_ms,
        )

@app.middleware("http")
async def bot_protection_middleware(request: Request, call_next):
    client_ip = request.client.host if request.client else ""
    user_agent = request.headers.get("user-agent", "").lower()

    # Bypass protection for internal localhost testing scripts (e.g., httpx tests)
    if client_ip in ["127.0.0.1", "localhost", "::1"]:
        return await call_next(request)

    # List of known common scraper tools and general bot identifiers
    blocked_keywords = [
        "python-requests", "curl", "wget", "scrapy", "urllib", "got", "axios",
        "spider", "crawl", "bot", "slurp", "postmanruntime", "insomnia", "httpclient",
        "ruby", "java", "php", "go-http-client", "httpx"
    ]

    # Check if the user agent contains any of the blocked keywords
    if any(keyword in user_agent for keyword in blocked_keywords):
        return JSONResponse(
            status_code=403,
            content={"detail": "Access Denied: Automated scraping bots are strictly prohibited."},
        )

    response = await call_next(request)
    return response

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
    content = {"detail": "Internal Server Error"}
    if settings.DEBUG:
        content["traceback"] = err
    return JSONResponse(
        status_code=500,
        content=content,
    )


# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=get_cors_origins(),
    allow_origin_regex=r"https?://(localhost|127\.0\.0\.1)(:\d+)?",
    allow_credentials=settings.CORS_ALLOW_CREDENTIALS,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(GZipMiddleware, minimum_size=1000)


@app.on_event("startup")
async def warm_database_connection():
    try:
        async with engine.begin() as connection:
            await connection.execute(text("SELECT 1"))
    except Exception as exc:
        print(f"Database warm-up skipped: {exc}")


if FRONTEND_DIST_DIR.exists():
    assets_dir = FRONTEND_DIST_DIR / "assets"
    if assets_dir.exists():
        app.mount("/assets", StaticFiles(directory=assets_dir), name="frontend-assets")

    for static_name in ("favicon.ico", "robots.txt"):
        static_file = FRONTEND_DIST_DIR / static_name
        if static_file.exists():
            async def serve_static_file(file_path: Path = static_file):
                return FileResponse(file_path)

            app.add_api_route(f"/{static_name}", serve_static_file, methods=["GET"], include_in_schema=False)

# Register routers
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(admin.router, prefix=settings.API_V1_STR)
app.include_router(pp.router, prefix=settings.API_V1_STR)
app.include_router(scrutiny.router, prefix=settings.API_V1_STR)
app.include_router(mom.router, prefix=settings.API_V1_STR)
app.include_router(metadata.router, prefix=settings.API_V1_STR)
app.include_router(ai_assist.router, prefix=settings.API_V1_STR)
app.include_router(analytics.router, prefix=settings.API_V1_STR)
app.include_router(search.router, prefix=settings.API_V1_STR)
app.include_router(notifications.router, prefix=settings.API_V1_STR)
app.include_router(compliance.router, prefix=settings.API_V1_STR)


@app.get("/")
async def root():
    if FRONTEND_INDEX_FILE.exists():
        return FileResponse(FRONTEND_INDEX_FILE)
    return {"message": "Parivesh API is running", "docs": "/docs"}


@app.get("/health")
async def health_check():
    return {"status": "ok"}


if FRONTEND_INDEX_FILE.exists():
    @app.get("/{full_path:path}", include_in_schema=False)
    async def serve_frontend(full_path: str):
        if full_path.startswith("api/") or full_path in {"docs", "redoc", "openapi.json"}:
            return JSONResponse(status_code=404, content={"detail": "Not Found"})

        requested_path = FRONTEND_DIST_DIR / full_path
        if full_path and requested_path.is_file():
            return FileResponse(requested_path)

        return FileResponse(FRONTEND_INDEX_FILE)

import asyncio
import json
from datetime import datetime, timezone
from urllib import request, error

from app.core.config import settings


class NaaSService:
    @staticmethod
    def _get_webhook_urls() -> list[str]:
        if not settings.NAAS_WEBHOOK_URLS:
            return []
        return [u.strip() for u in settings.NAAS_WEBHOOK_URLS.split(",") if u.strip()]

    @staticmethod
    def _post_json(url: str, payload: dict) -> None:
        data = json.dumps(payload).encode("utf-8")
        req = request.Request(url=url, data=data, method="POST")
        req.add_header("Content-Type", "application/json")
        if settings.NAAS_AUTH_TOKEN:
            req.add_header("Authorization", f"Bearer {settings.NAAS_AUTH_TOKEN}")

        try:
            with request.urlopen(req, timeout=settings.NAAS_TIMEOUT_SECONDS) as resp:
                resp.read()
        except error.URLError as exc:
            print(f"[NaaS] webhook delivery failed for {url}: {exc}")

    @staticmethod
    async def emit_event(event_type: str, payload: dict) -> None:
        if not settings.NAAS_ENABLED:
            return

        urls = NaaSService._get_webhook_urls()
        if not urls:
            return

        envelope = {
            "provider": settings.NAAS_PROVIDER,
            "project": settings.PROJECT_NAME,
            "event_type": event_type,
            "occurred_at": datetime.now(timezone.utc).isoformat(),
            "payload": payload,
        }

        tasks = [asyncio.to_thread(NaaSService._post_json, url, envelope) for url in urls]
        await asyncio.gather(*tasks, return_exceptions=True)

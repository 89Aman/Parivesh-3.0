import asyncio
import logging
import math
from collections import defaultdict, deque


logger = logging.getLogger("parivesh.latency")


def _percentile(values: list[float], percentile: float) -> float:
    if not values:
        return 0.0
    ordered = sorted(values)
    rank = max(0, min(len(ordered) - 1, math.ceil((percentile / 100.0) * len(ordered)) - 1))
    return float(ordered[rank])


class EndpointLatencyMetrics:
    def __init__(self, enabled: bool, window_size: int, log_every: int):
        self.enabled = enabled
        self.window_size = max(20, window_size)
        self.log_every = max(1, log_every)
        self._samples: dict[str, deque[float]] = defaultdict(
            lambda: deque(maxlen=self.window_size)
        )
        self._counts: dict[str, int] = defaultdict(int)
        self._lock = asyncio.Lock()

    async def record(self, method: str, path: str, status_code: int, duration_ms: float) -> None:
        if not self.enabled:
            return

        key = f"{method.upper()} {path}"
        async with self._lock:
            self._counts[key] += 1
            self._samples[key].append(duration_ms)
            count = self._counts[key]

            if count % self.log_every != 0:
                return

            sample_values = list(self._samples[key])
            p50 = _percentile(sample_values, 50.0)
            p95 = _percentile(sample_values, 95.0)
            sample_size = len(sample_values)

        logger.info(
            "latency endpoint=%s samples=%d p50_ms=%.1f p95_ms=%.1f last_ms=%.1f status=%d",
            key,
            sample_size,
            p50,
            p95,
            duration_ms,
            status_code,
        )

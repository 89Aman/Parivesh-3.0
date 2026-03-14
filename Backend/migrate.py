"""
Migration script – creates new tables / columns in Supabase for:
  • Feature 4  – risk_score / risk_level columns on applications
  • Feature 5  – notifications table
  • Feature 10 – compliance_tasks table
"""
import asyncio
import asyncpg
from app.core.config import settings


RAW_URL = (
    settings.DATABASE_URL
    .replace("postgresql+asyncpg://", "postgresql://")
    .replace("postgresql+psycopg2://", "postgresql://")
)

MIGRATIONS = [
    # ── Feature 4: risk scoring columns ──────────────────────────────────────
    """
    ALTER TABLE applications
        ADD COLUMN IF NOT EXISTS risk_score  INTEGER NOT NULL DEFAULT 0,
        ADD COLUMN IF NOT EXISTS risk_level  TEXT    NOT NULL DEFAULT 'LOW';
    """,

    # ── Feature 5: notifications table ───────────────────────────────────────
    """
    CREATE TABLE IF NOT EXISTS notifications (
        id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        message         TEXT NOT NULL,
        application_id  UUID REFERENCES applications(id) ON DELETE SET NULL,
        is_read         BOOLEAN NOT NULL DEFAULT FALSE,
        created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
    );
    """,
    """
    CREATE INDEX IF NOT EXISTS idx_notifications_user_id
        ON notifications (user_id);
    """,
    """
    CREATE INDEX IF NOT EXISTS idx_notifications_app_id
        ON notifications (application_id);
    """,

    # ── Feature 10: compliance_tasks table ───────────────────────────────────
    """
    CREATE TABLE IF NOT EXISTS compliance_tasks (
        id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        application_id  UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
        task_name       TEXT NOT NULL,
        description     TEXT,
        due_date        DATE,
        status          TEXT NOT NULL DEFAULT 'PENDING',
        submitted_at    TIMESTAMPTZ,
        created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
    );
    """,
    """
    CREATE INDEX IF NOT EXISTS idx_compliance_tasks_app_id
        ON compliance_tasks (application_id);
    """,

    # ── Optional: GIN index for global search (Feature 8) ────────────────────
    """
    CREATE INDEX IF NOT EXISTS idx_app_search
        ON applications USING gin(to_tsvector('english', project_name));
    """,
]


async def run():
    print(f"Connecting to Supabase …")
    conn = await asyncpg.connect(RAW_URL)
    try:
        for i, sql in enumerate(MIGRATIONS, 1):
            stmt = sql.strip()
            print(f"[{i}/{len(MIGRATIONS)}] {stmt[:60].replace(chr(10),' ')} …")
            await conn.execute(stmt)
            print(f"  ✓ done")
        print("\nAll migrations applied successfully.")
    finally:
        await conn.close()


if __name__ == "__main__":
    asyncio.run(run())

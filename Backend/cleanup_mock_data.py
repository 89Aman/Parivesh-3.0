import asyncio
from sqlalchemy import text

from app.core.db import engine


TABLES_TO_CLEAR = [
    "notifications",
    "audit_logs",
    "compliance_tasks",
    "meeting_applications",
    "meetings",
    "moms",
    "gists",
    "eds_issues",
    "eds_requests",
    "application_documents",
    "payments",
    "application_status_history",
    "application_parameters",
    "applications",
    "user_roles",
    "users",
]


async def count_rows(conn, table_name: str) -> int:
    result = await conn.execute(text(f"SELECT COUNT(*) FROM {table_name}"))
    return int(result.scalar_one())


async def main() -> None:
    async with engine.begin() as conn:
        print("Before cleanup:")
        for table_name in TABLES_TO_CLEAR:
            count = await count_rows(conn, table_name)
            print(f"  {table_name}: {count}")

        roles_before = await conn.execute(text("SELECT id, name, COALESCE(label, '') FROM roles ORDER BY id"))
        roles_rows_before = roles_before.fetchall()
        print("  roles:", len(roles_rows_before))

        truncate_sql = (
            "TRUNCATE TABLE "
            + ", ".join(TABLES_TO_CLEAR)
            + " RESTART IDENTITY CASCADE"
        )
        await conn.execute(text(truncate_sql))

        print("\nAfter cleanup:")
        for table_name in TABLES_TO_CLEAR:
            count = await count_rows(conn, table_name)
            print(f"  {table_name}: {count}")

        roles_after = await conn.execute(text("SELECT id, name, COALESCE(label, '') FROM roles ORDER BY id"))
        roles_rows_after = roles_after.fetchall()
        print("  roles:", len(roles_rows_after))
        for role_id, role_name, label in roles_rows_after:
            print(f"    - id={role_id}, name={role_name}, label={label}")

        print("\nCleanup complete. Non-role mock data removed; roles preserved.")


if __name__ == "__main__":
    asyncio.run(main())

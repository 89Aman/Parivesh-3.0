"""Check DB tables and test the submit flow."""
import asyncio
import sys
sys.path.insert(0, ".")

async def main():
    from app.core.db import engine
    from sqlalchemy import text

    async with engine.begin() as conn:
        result = await conn.execute(text("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name"))
        tables = [row[0] for row in result.fetchall()]
        print("Tables in DB:")
        for t in tables:
            print(f"  - {t}")
        
        # Check if audit_logs exists
        if "audit_logs" not in tables:
            print("\n*** audit_logs table MISSING! ***")
        else:
            print("\naudit_logs table exists")
        
        if "application_status_history" not in tables:
            print("*** application_status_history table MISSING! ***")
        else:
            print("application_status_history table exists")

asyncio.run(main())

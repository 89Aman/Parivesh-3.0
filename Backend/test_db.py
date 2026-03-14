import asyncio
from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine
import bcrypt

engine = create_async_engine('postgresql+asyncpg://postgres.ltlfgqyaxuuzltflfzls:vZbtfPmKWtqheDTX@aws-1-ap-southeast-2.pooler.supabase.com:5432/postgres')

def hash_pw(pw):
    return bcrypt.hashpw(pw.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

CREDENTIALS = {
    'admin@parivesh.gov.in': 'Admin@123',  # already correct
    'pp@parivesh.gov.in': 'PP@123',
    'scrutiny@parivesh.gov.in': 'Scrutiny@123',
    'mom@parivesh.gov.in': 'Mom@123',
    'admin@parivesh.demo': 'Admin@123',
    'pp@parivesh.demo': 'PP@123',
    'scrutiny@parivesh.demo': 'Scrutiny@123',
    'mom@parivesh.demo': 'Mom@123',
}

async def run():
    try:
        async with engine.begin() as conn:
            for email, pw in CREDENTIALS.items():
                pw_hash = hash_pw(pw)
                await conn.execute(
                    text("UPDATE users SET password_hash = :pw WHERE email = :email"),
                    {"pw": pw_hash, "email": email}
                )
                print(f"Updated {email} -> {pw}")
    finally:
        await engine.dispose()
    print("\nDone! Credentials:")
    for email, pw in CREDENTIALS.items():
        print(f"  {email} / {pw}")

asyncio.run(run())

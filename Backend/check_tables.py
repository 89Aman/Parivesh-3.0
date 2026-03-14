import sqlite3
conn = sqlite3.connect('parivesh.db')
tables = [r[0] for r in conn.execute("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name").fetchall()]
print("Existing tables:", tables)

# Check columns of applications table
cols = [r[1] for r in conn.execute("PRAGMA table_info(applications)").fetchall()]
print("applications columns:", cols)
conn.close()

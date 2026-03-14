import sqlite3
import os

db_path = 'parivesh.db'
if not os.path.exists(db_path):
    print(f"Error: {db_path} not found")
else:
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
    tables = [row[0] for row in cursor.fetchall()]
    print("Tables in DB:")
    for t in sorted(tables):
        print(f"  - {t}")
    conn.close()

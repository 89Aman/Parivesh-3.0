import sqlite3
import os

db_path = 'parivesh.db'
if not os.path.exists(db_path):
    print(f"Error: {db_path} not found")
else:
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    cursor.execute("SELECT id, name FROM sectors")
    sectors = cursor.fetchall()
    print("Sectors in DB:")
    for s in sectors:
        print(f"  ID: {s[0]}, Name: {s[1]}")
    conn.close()

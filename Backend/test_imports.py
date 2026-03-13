"""Verify all imports work and print the full API route table."""
from app.main import app

print("=" * 60)
print("  PARIVESH BACKEND — IMPORT VALIDATION")
print("=" * 60)
print(f"\n  Total routes registered: {len(app.routes)}\n")

# Group by prefix
groups = {}
for route in app.routes:
    methods = getattr(route, "methods", None)
    if not methods:
        continue
    path = route.path
    prefix = path.split("/")[3] if len(path.split("/")) > 3 else "root"
    groups.setdefault(prefix, []).append((sorted(methods), path))

for group, routes in sorted(groups.items()):
    print(f"  [{group.upper()}]")
    for methods, path in sorted(routes, key=lambda x: x[1]):
        print(f"    {','.join(methods):8s}  {path}")
    print()

print("=" * 60)
print("  ALL IMPORTS PASSED SUCCESSFULLY!")
print("=" * 60)

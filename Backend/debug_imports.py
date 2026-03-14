try:
    from pydantic import BaseModel
    print("Pydantic BaseModel imported")
    from pydantic_core import SchemaValidator
    print("Pydantic Core SchemaValidator imported")
    from fastapi import FastAPI
    print("FastAPI imported")
except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()

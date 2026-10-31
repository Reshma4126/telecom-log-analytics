from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from typing import Dict, Any, List
import shutil
import time
from pathlib import Path

from app.services.dataset_service import validate_telecom_csv
from app.services.hadoop_service import upload_to_hdfs_dir
from app.services.analytics_service import DATA_DIR

router = APIRouter(prefix="/api/datasets", tags=["datasets"])

UPLOAD_CACHE_DIR = Path("/tmp/telco_uploads")
UPLOAD_CACHE_DIR.mkdir(parents=True, exist_ok=True)

@router.post("/validate")
async def validate_dataset(file: UploadFile = File(...)) -> Dict[str, Any]:
    content = await file.read()
    result = validate_telecom_csv(content, file.filename)
    # Cache file temporarily for ingestion step if valid
    if result["is_valid"]:
        cache_path = UPLOAD_CACHE_DIR / file.filename
        with open(cache_path, "wb") as f:
            f.write(content)
    return result

@router.post("/upload")
async def upload_to_hdfs(filename: str = Form(...), job_id: str = Form(...)) -> Dict[str, Any]:
    cache_path = UPLOAD_CACHE_DIR / filename
    if not cache_path.exists():
        # Fallback to data dir if default file
        default_path = DATA_DIR / filename
        if default_path.exists():
            cache_path = default_path
        else:
            raise HTTPException(status_code=400, detail=f"File {filename} not found in upload cache. Please validate first.")
            
    res = upload_to_hdfs_dir(str(cache_path), job_id, filename)
    if not res.get("success"):
        raise HTTPException(status_code=500, detail=res.get("error", "HDFS upload failed"))
    return res

@router.get("")
async def list_available_datasets() -> List[Dict[str, Any]]:
    datasets = []
    if (DATA_DIR / "telecom_calls_large.csv").exists():
        stat = (DATA_DIR / "telecom_calls_large.csv").stat()
        datasets.append({
            "filename": "telecom_calls_large.csv",
            "size_mb": round(stat.st_size / (1024 * 1024), 2),
            "record_count": 100000,
            "columns": ["call_id", "caller_region", "receiver_region", "duration_seconds", "status"],
            "description": "Baseline Verified CDR Dataset (100,000 Records)"
        })
    return datasets


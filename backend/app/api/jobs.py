from fastapi import APIRouter, HTTPException, BackgroundTasks
from typing import Dict, Any, List
import time

from app.models.schemas import JobSubmissionRequest
from app.services.hadoop_service import (
    execute_mapreduce_job,
    load_jobs_history,
    get_job_output_summary,
    check_docker_daemon
)
from app.services.analytics_service import DATA_DIR, get_regional_summary_df

router = APIRouter(prefix="/api/jobs", tags=["jobs"])

@router.get("")
async def list_jobs() -> List[Dict[str, Any]]:
    return load_jobs_history()

@router.get("/{job_id}")
async def get_job(job_id: str) -> Dict[str, Any]:
    history = load_jobs_history()
    for j in history:
        if j.get("job_id") == job_id or j.get("app_id") == job_id:
            return j
    raise HTTPException(status_code=404, detail="Job not found")

@router.post("")
async def submit_job(req: JobSubmissionRequest) -> Dict[str, Any]:
    daemon = check_docker_daemon()
    if not daemon["available"]:
        raise HTTPException(
            status_code=503,
            detail=f"Docker cluster is offline: {daemon['reason']}. Please start Docker Desktop with WSL2 integration."
        )
        
    res = execute_mapreduce_job(req.hdfs_input_path, req.job_id)
    if not res.get("success"):
        raise HTTPException(status_code=500, detail=res.get("log", "MapReduce execution failed"))
    return res

@router.get("/{job_id}/results")
async def get_job_results(job_id: str) -> Dict[str, Any]:
    history = load_jobs_history()
    target_job = None
    for j in history:
        if j.get("job_id") == job_id or j.get("app_id") == job_id:
            target_job = j
            break
            
    if not target_job:
        raise HTTPException(status_code=404, detail="Job not found")
        
    out_dir = target_job.get("hdfs_output_path", "")
    summary_text = get_job_output_summary(out_dir)
    
    if not summary_text:
        # Fallback to local baseline summary
        df = get_regional_summary_df()
        records = df.to_dict(orient="records")
        return {"job_id": job_id, "source": "baseline_data", "records": records}
        
    lines = [l.split("\t") for l in summary_text.strip().split("\n") if l.strip()]
    records = []
    for line in lines:
        if len(line) >= 5:
            records.append({
                "region": line[0],
                "total_calls": int(line[1]),
                "successful_calls": int(line[2]),
                "failed_calls": int(line[3]),
                "duration_seconds": int(line[4]),
                "duration_minutes": round(int(line[4]) / 60.0, 1),
                "drop_rate": round((int(line[3]) / int(line[1])) * 100.0, 2) if int(line[1]) > 0 else 0.0
            })
    return {"job_id": job_id, "source": "hdfs_part_r_00000", "records": records}


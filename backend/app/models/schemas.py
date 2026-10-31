from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional

class DatasetMeta(BaseModel):
    filename: str
    size_mb: float
    record_count: int
    column_count: int
    columns: List[str]
    dtypes: Dict[str, str]
    is_valid: bool
    errors: List[str] = []
    warnings: List[str] = []
    sample_records: List[Dict[str, Any]] = []

class HDFSBlockInfo(BaseModel):
    connected: bool
    live_datanodes: int
    dead_datanodes: int
    configured_capacity: str
    dfs_used: str

class NodeManagerInfo(BaseModel):
    node_id: str
    state: str
    http_address: str
    running_containers: str
    active_maps: int = 0
    active_reduces: int = 0
    completed_tasks: int = 0

class ClusterStatusResponse(BaseModel):
    docker_available: bool
    cluster_online: bool
    containers: Dict[str, Any]
    hdfs: Dict[str, Any]
    yarn: Dict[str, Any]
    timestamp: str

class IngestionRequest(BaseModel):
    filename: str

class JobSubmissionRequest(BaseModel):
    job_id: str
    hdfs_input_path: str

class TaskAllocation(BaseModel):
    container_id: str
    worker_node: str
    role: str
    records_processed: str

class JobRecord(BaseModel):
    job_id: str
    app_id: str
    name: str = "TelecomAnalyzer"
    input_file: str
    hdfs_input_path: str
    hdfs_output_path: str
    submitted_time: str
    duration: str
    state: str
    final_status: str
    tasks: List[Dict[str, Any]] = []
    error_details: Optional[str] = None


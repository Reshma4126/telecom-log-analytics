from fastapi import APIRouter, Query, HTTPException
from typing import Dict, Any, List
import datetime
import subprocess
import json

from app.services.hadoop_service import (
    check_docker_daemon,
    get_containers_status,
    get_hdfs_report,
    get_yarn_nodes_info
)

router = APIRouter(prefix="/api/cluster", tags=["cluster"])

@router.get("/status")
async def get_cluster_status() -> Dict[str, Any]:
    daemon = check_docker_daemon()
    containers = get_containers_status()
    all_healthy = daemon["available"] and all(c.get("healthy", False) for c in containers.values())
    
    hdfs = get_hdfs_report()
    yarn = get_yarn_nodes_info()
    
    return {
        "docker_available": daemon["available"],
        "docker_message": daemon["reason"],
        "cluster_online": all_healthy,
        "containers": containers,
        "hdfs": hdfs,
        "yarn": yarn,
        "timestamp": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    }

@router.get("/nodes")
async def get_cluster_nodes() -> Dict[str, Any]:
    return get_yarn_nodes_info()

@router.get("/hdfs/browse")
async def browse_hdfs(path: str = Query("/telecom", description="HDFS directory path to browse")) -> Dict[str, Any]:
    """Browse files and directories directly in HDFS on telecom-master."""
    try:
        cmd = ["docker", "exec", "telecom-master", "hdfs", "dfs", "-ls", path]
        res = subprocess.run(cmd, capture_output=True, text=True, timeout=10)
        
        entries: List[Dict[str, Any]] = []
        if res.returncode == 0:
            lines = res.stdout.strip().splitlines()
            for line in lines:
                parts = line.split()
                if len(parts) >= 8 and not line.startswith("Found"):
                    permissions = parts[0]
                    is_dir = permissions.startswith("d")
                    replication = parts[1]
                    owner = parts[2]
                    group = parts[3]
                    size_bytes = int(parts[4]) if parts[4].isdigit() else 0
                    date_str = f"{parts[5]} {parts[6]}"
                    full_path = parts[7]
                    name = full_path.split("/")[-1]

                    size_formatted = f"{size_bytes} B"
                    if size_bytes >= 1024 * 1024:
                        size_formatted = f"{(size_bytes / (1024 * 1024)):.2f} MB"
                    elif size_bytes >= 1024:
                        size_formatted = f"{(size_bytes / 1024):.2f} KB"

                    entries.append({
                        "name": name,
                        "path": full_path,
                        "is_dir": is_dir,
                        "permissions": permissions,
                        "replication": replication,
                        "owner": owner,
                        "group": group,
                        "size_bytes": size_bytes,
                        "size_formatted": size_formatted if not is_dir else "-",
                        "modified": date_str
                    })

        return {
            "current_path": path,
            "entries": entries,
            "success": True
        }
    except Exception as e:
        return {
            "current_path": path,
            "entries": [],
            "error": str(e),
            "success": False
        }

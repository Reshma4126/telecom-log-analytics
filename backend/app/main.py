from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import asyncio
import datetime

from app.api import datasets, jobs, cluster, analytics
from app.services.hadoop_service import get_yarn_nodes_info, check_docker_daemon

app = FastAPI(
    title="TelcoPulse API",
    description="Enterprise Telecom Analytics & Hadoop MapReduce Orchestration API",
    version="2.0.0"
)

# CORS setup for Vite frontend (typically port 5173 or 3000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In development allow all; can restrict to localhost:5173
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Routers
app.include_router(datasets.router)
app.include_router(jobs.router)
app.include_router(cluster.router)
app.include_router(analytics.router)

@app.get("/api/health")
async def health_check():
    daemon = check_docker_daemon()
    return {
        "status": "healthy",
        "service": "TelcoPulse Backend",
        "docker_connected": daemon["available"],
        "timestamp": datetime.datetime.now().isoformat()
    }

# WebSocket for live worker & task updates
@app.websocket("/ws/execution")
async def execution_stream(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            # Poll every 2 seconds
            nodes = get_yarn_nodes_info()
            payload = {
                "timestamp": datetime.datetime.now().strftime("%H:%M:%S"),
                "nodes": nodes.get("nodes", []),
                "cluster_state": nodes.get("cluster_state", "DISCONNECTED")
            }
            await websocket.send_json(payload)
            await asyncio.sleep(2)
    except WebSocketDisconnect:
        pass
    except Exception:
        pass


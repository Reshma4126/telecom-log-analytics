from fastapi import APIRouter
from typing import Dict, Any

from app.services.analytics_service import (
    get_overview_metrics,
    get_regional_analytics_payload
)

router = APIRouter(prefix="/api/analytics", tags=["analytics"])

@router.get("/overview")
async def get_overview() -> Dict[str, Any]:
    return get_overview_metrics()

@router.get("/regional")
async def get_regional() -> Dict[str, Any]:
    return get_regional_analytics_payload()


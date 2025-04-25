from fastapi import APIRouter, Query, Depends, HTTPException
from pydantic import AnyUrl
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.schemas import PageVisitIn, PageVisitOut, PageVisitList
from app.services.page_visit_service import (
    create_page_visit,
    get_page_visits,
    get_url_metric,
)

router = APIRouter(prefix="/page-visits", tags=["page-visits"])


@router.post("", response_model=PageVisitOut)
async def create_page_visit_endpoint(
    page_visit_in: PageVisitIn, db: AsyncSession = Depends(get_db)
):
    return await create_page_visit(db, page_visit_in)


@router.get("", response_model=PageVisitList)
async def get_page_visits_endpoint(
    url: Optional[AnyUrl] = Query(None),
    offset: int = Query(0, ge=0, description="Pagination offset"),
    limit: int = Query(10, ge=1, le=100, description="Pagination limit"),
    db: AsyncSession = Depends(get_db),
):
    page_visits, total = await get_page_visits(
        db, str(url) if url else None, offset, limit
    )
    return {
        "page_visits": page_visits,
        "offset": offset,
        "limit": limit,
        "total": total,
    }


@router.get("/metric", response_model=PageVisitOut)
async def get_url_metric_endpoint(
    url: AnyUrl = Query(), db: AsyncSession = Depends(get_db)
):
    metric = await get_url_metric(db, str(url))
    if metric is None:
        raise HTTPException(status_code=404, detail="URL metric not found")
    return metric

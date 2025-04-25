from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from app.models import PageVisit
from app.schemas import PageVisitIn
from urllib.parse import urlparse


def normalize_url(url: str) -> str:
    """Normalize URL by removing trailing slash and ensuring consistent format."""
    parsed = urlparse(url)
    path = parsed.path.rstrip("/")
    # Only add trailing slash if path is empty
    if not path:
        path = "/"
    return f"{parsed.scheme}://{parsed.netloc}{path}"


async def create_page_visit(db: AsyncSession, page_visit_in: PageVisitIn) -> PageVisit:
    input_data = page_visit_in.model_dump()
    input_data["url"] = normalize_url(str(input_data["url"]))
    page_visit = PageVisit(**input_data)
    db.add(page_visit)
    await db.commit()
    await db.refresh(page_visit)
    return page_visit


async def get_page_visits(
    db: AsyncSession, url: str | None = None, offset: int = 0, limit: int = 10
) -> tuple[list[PageVisit], int]:
    if url is not None:
        url = normalize_url(url)
        total_result = await db.execute(
            select(func.count()).where(PageVisit.url == url).select_from(PageVisit)
        )
    else:
        total_result = await db.execute(select(func.count()).select_from(PageVisit))

    total = total_result.scalar_one()

    statement = (
        select(PageVisit)
        .offset(offset)
        .limit(limit)
        .order_by(PageVisit.datetime_visited.desc())
    )

    if url is not None:
        statement = statement.where(PageVisit.url == url)

    result = await db.execute(statement)
    page_visits = result.scalars().all()

    return page_visits, total


async def get_url_metric(db: AsyncSession, url: str) -> PageVisit | None:
    url = normalize_url(url)
    total_result = await db.execute(
        select(func.count()).where(PageVisit.url == url).select_from(PageVisit)
    )
    total = total_result.scalar_one()

    query = await db.execute(
        select(PageVisit)
        .where(PageVisit.url == url)
        .order_by(PageVisit.datetime_visited.desc())
    )

    page_visit = query.scalars().first()
    if page_visit:
        page_visit.total_visits = total
    return page_visit

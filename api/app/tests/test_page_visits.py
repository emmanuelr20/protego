import pytest
from datetime import datetime, UTC
from fastapi.testclient import TestClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import PageVisit
from app.schemas import PageVisitIn
from app.services.page_visit_service import normalize_url


@pytest.fixture
def sample_page_visit_data():
    return {
        "url": "https://example.com",
        "link_count": 10,
        "image_count": 5,
        "word_count": 100,
        "character_count": 500,
        "datetime_visited": datetime.now(UTC).isoformat(),
    }


@pytest.fixture
def sample_page_visit_data_with_trailing_slash():
    return {
        "url": "https://example.com/",
        "link_count": 10,
        "image_count": 5,
        "word_count": 100,
        "character_count": 500,
        "datetime_visited": datetime.now(UTC).isoformat(),
    }


@pytest.mark.asyncio
async def test_create_page_visit(
    client: TestClient, test_db: AsyncSession, sample_page_visit_data
):
    response = client.post("/page-visits", json=sample_page_visit_data)
    assert response.status_code == 200
    data = response.json()
    assert data["url"] == normalize_url(sample_page_visit_data["url"])
    assert data["link_count"] == sample_page_visit_data["link_count"]
    assert data["image_count"] == sample_page_visit_data["image_count"]
    assert data["word_count"] == sample_page_visit_data["word_count"]
    assert data["character_count"] == sample_page_visit_data["character_count"]
    assert "id" in data


@pytest.mark.asyncio
async def test_create_page_visit_with_trailing_slash(
    client: TestClient,
    test_db: AsyncSession,
    sample_page_visit_data_with_trailing_slash,
):
    response = client.post(
        "/page-visits", json=sample_page_visit_data_with_trailing_slash
    )
    assert response.status_code == 200
    data = response.json()
    assert data["url"] == normalize_url(
        sample_page_visit_data_with_trailing_slash["url"]
    )
    assert (
        data["link_count"] == sample_page_visit_data_with_trailing_slash["link_count"]
    )
    assert (
        data["image_count"] == sample_page_visit_data_with_trailing_slash["image_count"]
    )
    assert (
        data["word_count"] == sample_page_visit_data_with_trailing_slash["word_count"]
    )
    assert (
        data["character_count"]
        == sample_page_visit_data_with_trailing_slash["character_count"]
    )
    assert "id" in data


@pytest.mark.asyncio
async def test_create_page_visit_invalid_url(
    client: TestClient, test_db: AsyncSession, sample_page_visit_data
):
    invalid_data = sample_page_visit_data.copy()
    invalid_data["url"] = "not-a-valid-url"
    response = client.post("/page-visits", json=invalid_data)
    assert response.status_code == 422
    data = response.json()
    assert "detail" in data


@pytest.mark.asyncio
async def test_create_page_visit_missing_required_field(
    client: TestClient, test_db: AsyncSession, sample_page_visit_data
):
    invalid_data = sample_page_visit_data.copy()
    del invalid_data["url"]
    response = client.post("/page-visits", json=invalid_data)
    assert response.status_code == 422
    data = response.json()
    assert "detail" in data


@pytest.mark.asyncio
async def test_get_page_visits_empty(client: TestClient, test_db: AsyncSession):
    response = client.get("/page-visits")
    assert response.status_code == 200
    data = response.json()
    assert data["page_visits"] == []
    assert data["total"] == 0
    assert data["offset"] == 0
    assert data["limit"] == 10


@pytest.mark.asyncio
async def test_get_page_visits_with_data(
    client: TestClient, test_db: AsyncSession, sample_page_visit_data
):
    # Create a page visit first
    client.post("/page-visits", json=sample_page_visit_data)

    # Test getting all page visits
    response = client.get("/page-visits")
    assert response.status_code == 200
    data = response.json()
    assert len(data["page_visits"]) == 1
    assert data["total"] == 1
    assert data["page_visits"][0]["url"] == normalize_url(sample_page_visit_data["url"])


@pytest.mark.asyncio
async def test_get_page_visits_with_url_filter(
    client: TestClient, test_db: AsyncSession, sample_page_visit_data
):
    # Create a page visit first
    client.post("/page-visits", json=sample_page_visit_data)

    # Test getting page visits with URL filter
    response = client.get(f"/page-visits?url={sample_page_visit_data['url']}")
    assert response.status_code == 200
    data = response.json()
    assert len(data["page_visits"]) == 1
    assert data["total"] == 1
    assert data["page_visits"][0]["url"] == normalize_url(sample_page_visit_data["url"])


@pytest.mark.asyncio
async def test_get_page_visits_with_pagination(
    client: TestClient, test_db: AsyncSession, sample_page_visit_data
):
    # Create multiple page visits
    for _ in range(3):
        client.post("/page-visits", json=sample_page_visit_data)

    # Test pagination
    response = client.get("/page-visits?offset=1&limit=2")
    assert response.status_code == 200
    data = response.json()
    assert len(data["page_visits"]) == 2
    assert data["total"] == 3
    assert data["offset"] == 1
    assert data["limit"] == 2


@pytest.mark.asyncio
async def test_get_page_visits_with_invalid_pagination(
    client: TestClient, test_db: AsyncSession
):
    # Test invalid pagination parameters
    response = client.get("/page-visits?offset=-1&limit=0")
    assert response.status_code == 422
    data = response.json()
    assert "detail" in data


@pytest.mark.asyncio
async def test_get_url_metric(
    client: TestClient, test_db: AsyncSession, sample_page_visit_data
):
    # Create a page visit first
    client.post("/page-visits", json=sample_page_visit_data)

    # Test getting URL metric
    response = client.get(f"/page-visits/metric?url={sample_page_visit_data['url']}")
    assert response.status_code == 200
    data = response.json()
    assert data["url"] == normalize_url(sample_page_visit_data["url"])
    assert data["total_visits"] == 1


@pytest.mark.asyncio
async def test_get_url_metric_not_found(client: TestClient, test_db: AsyncSession):
    response = client.get("/page-visits/metric?url=https://nonexistent.com")
    assert response.status_code == 404
    data = response.json()
    assert data["detail"] == "URL metric not found"


@pytest.mark.asyncio
async def test_get_url_metric_invalid_url(client: TestClient, test_db: AsyncSession):
    response = client.get("/page-visits/metric?url=not-a-valid-url")
    assert response.status_code == 422
    data = response.json()
    assert "detail" in data

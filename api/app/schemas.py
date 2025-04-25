from typing import Optional, List
from datetime import datetime

from pydantic import BaseModel, AnyUrl, Field, AliasChoices, ConfigDict


class PageVisitIn(BaseModel):
    url: AnyUrl
    link_count: int = Field(validation_alias=AliasChoices("link_count", "linkCount"))
    image_count: int = Field(validation_alias=AliasChoices("image_count", "imageCount"))
    word_count: int = Field(validation_alias=AliasChoices("word_count", "wordCount"))
    character_count: int = Field(
        validation_alias=AliasChoices("character_count", "characterCount")
    )
    datetime_visited: datetime = Field(
        validation_alias=AliasChoices("datetime_visited", "datetimeVisited")
    )

    model_config = ConfigDict(json_encoders={AnyUrl: lambda v: str(v)})


class PageVisitOut(PageVisitIn):
    id: int
    total_visits: Optional[int] = None


class PageVisitList(BaseModel):
    page_visits: List[PageVisitOut]
    offset: int
    limit: int
    total: int


class MessageResponse(BaseModel):
    message: str

from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime
from app.database import Base


class PageVisit(Base):
    __tablename__ = "page_visits"

    id = Column(Integer, primary_key=True, index=True)
    url = Column(String)
    link_count = Column(Integer)
    image_count = Column(Integer)
    word_count = Column(Integer)
    character_count = Column(Integer)
    datetime_visited = Column(DateTime(timezone=True), nullable=True)

    def __repr__(self):
        return (
            f"<PageVisit(url='{self.url}', datetime_visited={self.datetime_visited})>"
        )

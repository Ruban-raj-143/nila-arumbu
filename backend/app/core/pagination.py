"""
Nila Arumbu — Pagination Utilities
Standardised page/size query params and response envelope.
"""
from typing import Generic, TypeVar
from pydantic import BaseModel, Field
from fastapi import Query

T = TypeVar("T")


class PageParams:
    """FastAPI dependency for pagination query params."""
    def __init__(
        self,
        page: int = Query(1, ge=1, description="Page number"),
        size: int = Query(20, ge=1, le=100, description="Items per page"),
    ) -> None:
        self.page = page
        self.size = size

    @property
    def offset(self) -> int:
        return (self.page - 1) * self.size


class PagedResponse(BaseModel, Generic[T]):
    items: list[T]
    total: int
    page: int
    size: int
    pages: int

    @classmethod
    def build(cls, items: list[T], total: int, params: PageParams) -> "PagedResponse[T]":
        pages = max(1, -(-total // params.size))  # ceiling division
        return cls(items=items, total=total, page=params.page, size=params.size, pages=pages)

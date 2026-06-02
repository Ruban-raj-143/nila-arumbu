"""
Nila Arumbu — Domain Exception Hierarchy
All business exceptions inherit from NilaBaseError so handlers can catch them uniformly.
"""
from fastapi import HTTPException, status


class NilaBaseError(Exception):
    """Root exception for all Nila Arumbu domain errors."""
    http_status: int = status.HTTP_500_INTERNAL_SERVER_ERROR
    detail: str = "An unexpected error occurred."

    def __init__(self, detail: str | None = None) -> None:
        self.detail = detail or self.__class__.detail
        super().__init__(self.detail)

    def to_http(self) -> HTTPException:
        return HTTPException(status_code=self.http_status, detail=self.detail)


class NotFoundError(NilaBaseError):
    http_status = status.HTTP_404_NOT_FOUND
    detail = "Resource not found."


class ConflictError(NilaBaseError):
    http_status = status.HTTP_409_CONFLICT
    detail = "Resource already exists."


class ValidationError(NilaBaseError):
    http_status = status.HTTP_422_UNPROCESSABLE_CONTENT
    detail = "Validation failed."


class ForbiddenError(NilaBaseError):
    http_status = status.HTTP_403_FORBIDDEN
    detail = "Access denied."


class InvalidStateTransitionError(NilaBaseError):
    http_status = status.HTTP_400_BAD_REQUEST

    def __init__(self, from_state: str, to_state: str, allowed: list[str]) -> None:
        detail = (
            f"Cannot transition from '{from_state}' to '{to_state}'. "
            f"Allowed: {allowed}."
        )
        super().__init__(detail)


class RiskCalculationError(NilaBaseError):
    http_status = status.HTTP_500_INTERNAL_SERVER_ERROR
    detail = "Risk calculation failed."

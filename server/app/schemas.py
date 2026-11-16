"""Request bodies and their validation rules (business logic for incoming data).

Pydantic checks every request against these models before the route code runs.
If a rule fails, FastAPI answers 422 with a message saying which field is wrong,
so bad data never reaches the database.
"""

from typing import Literal

from pydantic import BaseModel, Field, field_validator, model_validator

Program = Literal["h2a", "h2b", "eb3"]
ClientType = Literal["business", "individual"]
ClientStatus = Literal["active", "waiting", "onboarding"]


def _clean(value: str | None) -> str | None:
    """Trim spaces; turn an empty string into None."""
    if value is None:
        return None
    value = value.strip()
    return value or None


class LoginRequest(BaseModel):
    email: str = Field(min_length=3, max_length=254)
    password: str = Field(min_length=1, max_length=200)

    @field_validator("email")
    @classmethod
    def normalize_email(cls, value: str) -> str:
        # Emails are compared lower-case so "Demo@Atlas.test" still signs in.
        return value.strip().lower()


class ClientCreate(BaseModel):
    """Rules for ATL-2 (add a client) and ATL-3 (put a client in programs)."""

    name: str = Field(max_length=200)
    type: ClientType
    industry: str | None = Field(default=None, max_length=200)
    location: str | None = Field(default=None, max_length=200)
    primary_contact: str | None = Field(default=None, max_length=200)
    status: ClientStatus = "onboarding"
    programs: list[Program] = Field(default_factory=list)

    @field_validator("name")
    @classmethod
    def name_required(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("Name is required.")
        return value

    @field_validator("industry", "location", "primary_contact")
    @classmethod
    def trim_optional(cls, value: str | None) -> str | None:
        return _clean(value)

    @field_validator("programs")
    @classmethod
    def unique_programs(cls, value: list[str]) -> list[str]:
        # Keep the order the user picked, drop duplicates like ["h2a", "h2a"].
        return list(dict.fromkeys(value))

    @model_validator(mode="after")
    def industry_only_for_businesses(self) -> "ClientCreate":
        # ATL-2: industry only applies to businesses, so it is dropped for individuals.
        if self.type == "individual":
            self.industry = None
        return self

from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


class QueryRequest(BaseModel):
    """Request model for RAG queries."""

    prompt: str = Field(..., description="User's question or prompt")
    user_context: str | None = Field(
        None,
        description="Personal information or context about the user",
    )
    top_k: int = Field(
        default=5, ge=1, le=20, description="Number of documents to retrieve"
    )


class IngestRequest(BaseModel):
    """Request model for document ingestion."""

    directory_path: str | None = Field(
        None,
        description="Custom path to documents directory",
    )
    file_extensions: list[str] = Field(
        default=[".txt", ".md"],
        description="File extensions to process",
    )


class AstrolabeRequest(BaseModel):
    """Request model for Ziwei astrolabe generation."""

    model_config = ConfigDict(populate_by_name=True)

    name: str | None = Field(default=None, description="User name")
    gender: Literal["male", "female"] = Field(..., description="User gender")
    birth_year: int = Field(..., alias="birthYear", description="Birth year")
    birth_month: int = Field(
        ..., alias="birthMonth", ge=1, le=12, description="Birth month"
    )
    birth_day: int = Field(
        ..., alias="birthDay", ge=1, le=31, description="Birth day"
    )
    birth_shichen: Literal[
        "zi",
        "chou",
        "yin",
        "mao",
        "chen",
        "si",
        "wu",
        "wei",
        "shen",
        "you",
        "xu",
        "hai",
    ] = Field(..., alias="birthShichen", description="Birth shichen")
    calendar_type: Literal["solar", "lunar"] = Field(
        default="solar",
        alias="calendarType",
        description="Calendar type",
    )
    is_leap_month: bool | None = Field(
        default=None,
        alias="isLeapMonth",
        description="Lunar leap month flag",
    )


class AstrolabeSubmitRequest(BaseModel):
    """Request model for submitting a computed astrolabe."""

    model_config = ConfigDict(populate_by_name=True)

    birth_info: AstrolabeRequest = Field(
        ...,
        alias="birthInfo",
        description="Birth info used to generate the astrolabe",
    )
    astrolabe: dict = Field(..., description="Computed astrolabe payload")


class MeiwenCastRequest(BaseModel):
    """Request model for Meiwen divination."""

    timestamp: str | None = Field(
        default=None,
        description="ISO timestamp used for casting (optional, defaults to now)",
    )
    question: str | None = Field(
        default="",
        description="Question or topic for the divination",
    )

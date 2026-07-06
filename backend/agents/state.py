from __future__ import annotations

from typing import TypedDict


class Source(TypedDict):
    title: str
    url: str
    snippet: str


class Finding(TypedDict):
    task: str
    summary: str
    source_url: str
    source_title: str


class ResearchState(TypedDict):
    query: str
    tasks: list[str]
    current_task_index: int
    findings: list[Finding]
    verified: bool
    retry_count: int
    max_retries: int
    messages: list[str]
    report: str
    sources: list[Source]
    errors: list[str]

from __future__ import annotations

from dataclasses import dataclass

import trafilatura


@dataclass(frozen=True)
class FetchResult:
    url: str
    text: str


def fetch_page_text(url: str, max_chars: int = 12000) -> FetchResult:
    downloaded = trafilatura.fetch_url(url)
    if not downloaded:
        return FetchResult(url=url, text="")
    text = trafilatura.extract(downloaded, include_comments=False, include_tables=True) or ""
    return FetchResult(url=url, text=text[:max_chars])

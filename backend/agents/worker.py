from __future__ import annotations

from agents.state import Finding, ResearchState
from config import Settings
from llm.client import LLMClient
from tools.fetch_tool import fetch_page_text
from tools.search_tool import SerpApiSearchTool


def _summarize(task: str, title: str, url: str, text: str, settings: Settings) -> str:
    prompt = (
        "Summarize the evidence relevant to the research task in 3-5 sentences. "
        "Stay factual and mention uncertainty. Do not invent details.\n\n"
        f"Task: {task}\nSource title: {title}\nURL: {url}\n\nSource text:\n{text[:settings.fetch_max_chars]}"
    )
    return LLMClient(settings).invoke(prompt)


def work_node(state: ResearchState, settings: Settings) -> ResearchState:
    search_tool = SerpApiSearchTool(settings)
    findings: list[Finding] = list(state["findings"])
    sources = list(state["sources"])
    errors = list(state["errors"])

    pending_tasks = state["tasks"][state["current_task_index"] :]
    for task in pending_tasks:
        try:
            results = search_tool.search(task, limit=settings.search_results_limit)
            sources.extend(results)
            for result in results[:2]:
                page = fetch_page_text(result["url"], max_chars=settings.fetch_max_chars)
                source_text = page.text or result["snippet"]
                if not source_text:
                    continue
                try:
                    summary = _summarize(task, result["title"], result["url"], source_text, settings)
                except Exception as exc:
                    summary = f"Could not summarize with LLM, but source appears relevant. Error: {exc}"
                    errors.append(f"Worker summary error for {result['url']}: {exc}")
                findings.append(
                    {
                        "task": task,
                        "summary": summary,
                        "source_url": result["url"],
                        "source_title": result["title"],
                    }
                )
        except Exception as exc:
            errors.append(f"Worker error for task '{task}': {exc}")

    return {
        **state,
        "findings": findings,
        "sources": sources,
        "current_task_index": len(state["tasks"]),
        "messages": [*state["messages"], f"Collected {len(findings)} findings."],
        "errors": errors,
    }

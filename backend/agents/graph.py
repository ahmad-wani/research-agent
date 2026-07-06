from __future__ import annotations

from langgraph.graph import END, StateGraph

from agents.planner import plan_node
from agents.state import ResearchState
from agents.synthesizer import synthesize_node
from agents.verifier import verify_node
from agents.worker import work_node
from config import Settings


def _verification_route(state: ResearchState) -> str:
    # This is the graph's guardrail: retry only when the verifier asks for more
    # evidence and the configured retry budget has not been consumed.
    if state["verified"]:
        return "synthesizer"
    if state["retry_count"] < state["max_retries"]:
        return "worker"
    return "synthesizer"


def build_graph(settings: Settings):
    graph = StateGraph(ResearchState)

    graph.add_node("planner", lambda state: plan_node(state, settings))
    graph.add_node("worker", lambda state: work_node(state, settings))
    graph.add_node("verifier", lambda state: verify_node(state, settings))
    graph.add_node("synthesizer", lambda state: synthesize_node(state, settings))

    graph.set_entry_point("planner")
    graph.add_edge("planner", "worker")
    graph.add_edge("worker", "verifier")
    graph.add_conditional_edges(
        "verifier",
        _verification_route,
        {"worker": "worker", "synthesizer": "synthesizer"},
    )
    graph.add_edge("synthesizer", END)

    return graph.compile()

from __future__ import annotations

from langchain_core.messages import HumanMessage

from config import Settings


class LLMClient:
    def __init__(self, settings: Settings) -> None:
        self.settings = settings

    def _groq(self):
        if not self.settings.groq_api_key:
            raise RuntimeError("GROQ_API_KEY is required for Groq provider.")
        from langchain_groq import ChatGroq

        return ChatGroq(
            api_key=self.settings.groq_api_key,
            model=self.settings.groq_model,
            temperature=0.1,
        )

    def _gemini(self):
        if not self.settings.gemini_api_key:
            raise RuntimeError("GEMINI_API_KEY is required for Gemini provider.")
        from langchain_google_genai import ChatGoogleGenerativeAI

        return ChatGoogleGenerativeAI(
            google_api_key=self.settings.gemini_api_key,
            model=self.settings.gemini_model,
            temperature=0.1,
        )

    def _primary(self):
        return self._gemini() if self.settings.llm_provider == "gemini" else self._groq()

    def _fallback(self):
        return self._groq() if self.settings.llm_provider == "gemini" else self._gemini()

    def invoke(self, prompt: str) -> str:
        try:
            response = self._primary().invoke([HumanMessage(content=prompt)])
        except Exception:
            response = self._fallback().invoke([HumanMessage(content=prompt)])
        return str(response.content)

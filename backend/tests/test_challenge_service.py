import app.services.challenge_service as challenge_service_module
from app.services.challenge_service import ChallengeService


class FakeCollection:
    def __init__(self, docs):
        self.docs = docs

    def find(self, query):
        if not query:
            return list(self.docs)
        return [doc for doc in self.docs if all(doc.get(k) == v for k, v in query.items())]


def test_get_random_challenge_normalizes_case_insensitive_filters(monkeypatch):
    docs = [
        {"_id": "1", "category": "logic", "difficulty": "easy", "title": "Logic challenge"},
        {"_id": "2", "category": "math", "difficulty": "medium", "title": "Math challenge"},
    ]

    monkeypatch.setattr(challenge_service_module.mongo_client, "get_collection", lambda name: FakeCollection(docs))
    monkeypatch.setattr(challenge_service_module.random, "choice", lambda items: items[0])

    service = ChallengeService()
    challenge = service.get_random_challenge(category="Math", difficulty="Medium")

    assert challenge is not None
    assert challenge["category"] == "math"
    assert challenge["difficulty"] == "medium"

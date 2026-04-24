import json
import datetime
import logging

from config import CHANNEL_NAME, DOCUMENT_KEY, SNAPSHOT_EVERY

class CollaborationService:
    """
    Owns the shared document state in Redis.
    Exposes append_character() which atomically updates the document
    and publishes the event.
    """
    def __init__(self, redis_client):
        self.redis = redis_client
        self.version_counter = 0

    def _reset_document(self):
        self.redis.delete(DOCUMENT_KEY)
        self.version_counter = 0

    def clear_document(self):
        self._reset_document()
        now = datetime.datetime.now().isoformat()
        
        event = {
            "type": "document_cleared",
            "timestamp": now
        }
        self.redis.publish(CHANNEL_NAME, json.dumps(event))
        logging.info("Document cleared")
        print("[Service] Document cleared")

    def append_character(self, user: str, char: str, role: str = "editor") -> dict:
        # Atomically append char to Redis string
        new_len = self.redis.append(DOCUMENT_KEY, char)
        
        # We need the current document state to format the event
        current_document_bytes = self.redis.get(DOCUMENT_KEY)
        current_document = current_document_bytes.decode("utf-8") if current_document_bytes else ""
        
        self.version_counter += 1
        
        now = datetime.datetime.now().isoformat()
        
        event = {
            "type": "char_appended",
            "user": user,
            "char": char,
            "role": role,
            "document_state": current_document,
            "timestamp": now,
            "version": self.version_counter
        }

        if self.version_counter > 0 and self.version_counter % SNAPSHOT_EVERY == 0:
            version_id = self.version_counter // SNAPSHOT_EVERY
            event["version_snapshot"] = {
                "version": version_id,
                "snapshot": current_document,
                "char_count": len(current_document),
                "delta": SNAPSHOT_EVERY,
                "triggered_by": user,
                "timestamp": now,
                "label": f"v{version_id}"
            }
            logging.info(f"Snapshot created at version {version_id}")

        # Publishing the JSON payload is the core of the Pub/Sub architecture we want to show.
        self.redis.publish(CHANNEL_NAME, json.dumps(event))
        print(f"[{user:<5}] ({role}) typed '{char}'  →  Document: \"{current_document}\"")
        return event

    def get_document(self) -> str:
        """Read the latest document value from Redis and decode bytes into a Python string."""
        raw_document = self.redis.get(DOCUMENT_KEY) or b""
        return raw_document.decode("utf-8")

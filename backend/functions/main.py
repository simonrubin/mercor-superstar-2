# Welcome to Cloud Functions for Firebase for Python!
# To get started, simply uncomment the below code or create your own.
# Deploy with `firebase deploy`

from firebase_functions import https_fn
from firebase_admin import initialize_app
import api.openai as openai
import json

initialize_app()

@https_fn.on_request()
def chat(req: https_fn.Request) -> https_fn.Response:
    if 'sessionId' not in req.json:
        return https_fn.HttpsError("invalid-argument", "sessionId is required")
    
    query = req.json["query"]
    session_id = req.json["sessionId"]
    payload = openai.run_assistant(session_id, query)
    return https_fn.Response(response=json.dumps(payload))

@https_fn.on_request()
def delete_chat(req: https_fn.Request) -> https_fn.Response:
    session_id = req.json["sessionId"]
    openai.delete_thread(session_id)
    return https_fn.Response(response=json.dumps({"success": True}))

@https_fn.on_request()
def create_chat(req: https_fn.Request) -> https_fn.Response:
    return https_fn.Response(response=json.dumps({"sessionId": openai.create_thread().id}))

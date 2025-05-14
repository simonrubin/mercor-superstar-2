import api.common as common
import os.path
from google.oauth2.credentials import Credentials
from google.auth.transport.requests import Request
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build

PATH_TO_TOKEN = common.get_path('../json/google_auth_token.json')
PATH_TO_SECRET = common.get_path('../json/google_credentials.json')

SCOPES = [
   'https://www.googleapis.com/auth/spreadsheets',
   'https://www.googleapis.com/auth/gmail.addons.current.action.compose',
   'https://mail.google.com/',
   'https://www.googleapis.com/auth/drive',
]

def authenticate():
    creds = None
    if os.path.exists(PATH_TO_TOKEN):
        creds = Credentials.from_authorized_user_file(PATH_TO_TOKEN, SCOPES)
    # If there are no (valid) credentials available, let the user log in.
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            flow = InstalledAppFlow.from_client_secrets_file(PATH_TO_SECRET, SCOPES)
            creds = flow.run_local_server(port=0)
        # Save the credentials for the next run
        with open(PATH_TO_TOKEN, 'w') as token:
            token.write(creds.to_json())
    return creds

creds = authenticate()
gsheets_service = build("sheets", "v4", credentials=creds)
gmail_service = build("gmail", "v1", credentials=creds)
gdrive_service = build("drive", "v3", credentials=creds)
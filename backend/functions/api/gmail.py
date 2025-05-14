import api.gauth as gauth
import base64
from email.mime.text import MIMEText

SENDER = 'quantum-coupon-ai@gmail.com'

def send(message, subject, to):
  
  def create_message(sender, to, subject, message_text):
    message = MIMEText(message_text)
    message['to'] = to
    message['from'] = sender
    message['subject'] = subject
    raw_message = base64.urlsafe_b64encode(message.as_string().encode("utf-8"))
    return {'raw': raw_message.decode("utf-8")}
  
  def send_message(user_id, message):
    try:
        email = gauth.gmail_service.users().messages().send(userId=user_id, body=message).execute()
        return email['threadId']
    except Exception as e:
        print('An error occurred: %s' % e)
        return False
    
  message = create_message(SENDER, to, subject, message)
  return send_message(SENDER, message)
    
def search_inbox():
   
    def find():
        return gauth.gmail_service.users().messages().list(userId='me', q='is:unread').execute().get('messages', [])
      
    def get(message_id):
        return gauth.gmail_service.users().messages().get(userId='me', id=message_id).execute()

    def extract_sender(message):
        return list(filter(lambda x: x['name'] == 'From', message['payload']['headers']))[0]['value']
    
    def extract_content(message):
        return base64.urlsafe_b64decode(message['payload']['parts'][0]['body']['data']).decode('utf-8')

    matches = []

    for message in find():
        try:
            email = get(message['id'])
            sender = extract_sender(email)
            content = extract_content(email)
            matches.append({'sender': sender, 'content': content, 'threadId': message['threadId'], 'id': message['id']})
        except Exception:
            pass
    
    return matches
   
def mark_as_read(message_id):
    return gauth.gmail_service.users().messages().modify(userId='me', id=message_id, body={'removeLabelIds': ['UNREAD']}).execute()
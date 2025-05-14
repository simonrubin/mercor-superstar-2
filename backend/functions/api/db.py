from firebase_admin import firestore

def get_thread(thread_id : str):
    return firestore.client().collection("threads").document(thread_id).get()

def get_businesses(thread_id : str):
    doc = get_thread(thread_id=thread_id)
    return doc.to_dict()['businesses'] if doc.exists else []

def get_business(thread_id : str, business_id : str):
    businesses = get_businesses(thread_id=thread_id)
    return next(filter(lambda x : x['id'] == business_id, businesses), None)

def get_spreadsheet_id(thread_id : str):
    doc = get_thread(thread_id=thread_id)
    if doc.exists and 'spreadsheetId' in doc.to_dict():
        return doc.to_dict()['spreadsheetId']
    return None

def set_businesses(thread_id : str, businesses : list):
    firestore.client().collection("threads").document(thread_id).set({'businesses' : businesses})

def set_spreadsheet_id(thread_id : str, spreadsheet_id : str):
    firestore.client().collection("threads").document(thread_id).update({'spreadsheetId' : spreadsheet_id})

def set_email(business_id: str, message : str, subject : str):
    firestore.client().collection("email").document(business_id).set({'message' : message, 'subject' : subject})

def get_email(business_id: str):
    doc = firestore.client().collection("email").document(business_id).get()
    return doc.to_dict() if doc.exists else None

def set_email_recipient(gmail_thread_id : str, business_id : str):
    firestore.client().collection("email").document(gmail_thread_id).set({'businessId' : business_id})
    
def get_email_recipient(gmail_thread_id : str):
    doc = firestore.client().collection("email").document(gmail_thread_id).get()
    return doc.to_dict()['businessId'] if doc.exists else None

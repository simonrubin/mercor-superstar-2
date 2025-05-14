import api.gauth as gauth

def mark_file_public(file_id):
    return gauth.gdrive_service.permissions().create(
        fileId=file_id,
        body={'type': 'anyone', 'role': 'reader'},
    ).execute()


import api.gauth as gauth
import api.gdrive as gdrive
from googleapiclient.errors import HttpError
from model.business import Business

SHEET_URL = 'https://docs.google.com/spreadsheets/d/'

def create_spreadsheet(title: str, data : list[Business]):
  def create_row(values : list, i):
     entries = list(map(lambda x: {"userEnteredValue": {"stringValue": str(x)}}, values))
     return {"startRow":i ,"rowData" :[{"values": entries }]}


  try:
    rows = [
       create_row(['ID', 'Name', 'Star Rating', 'Review Count', 'Phone', 'Address', 'Contacted', 'Interested'], 0),
    ]

    for i,business in enumerate(data):
        values = [
            business['id'],
            business['name'],
            business['star_rating'],
            business['review_count'],
            business['phone'],
            business['address'],
            business['contacted'],
            business['interested'],
        ]
        rows.append(create_row(values, i+1))

    spreadsheet = (
        gauth.gsheets_service.spreadsheets()
        .create(
           body= {
                   "properties": {
                      "title": title
                    },
                    "sheets": [{
                       "properties": {
                            "title": "Businesses"
                        },
                        "data": rows,
                    }]
                }, 
            fields="spreadsheetId,sheets")
        .execute()
    )

    spreadsheet_id = spreadsheet.get("spreadsheetId")
    sheet_id = spreadsheet.get("sheets")[0].get("properties").get("sheetId")

    autofit(spreadsheet_id, sheet_id)
    gdrive.mark_file_public(spreadsheet_id)
    
    return SHEET_URL + spreadsheet_id
  except HttpError as error:
    print(f"An error occurred: {error}")
    return error
 
def update_row(spreadsheet_id: str, row_id : str, contacted : str = '', interested : str = ''):
    def read(spreadsheet_id):
        return gauth.gsheets_service.spreadsheets().values().get(spreadsheetId=spreadsheet_id, range='Businesses').execute()
    
    def index_of(spreadsheet, row_id):
        for i, row in enumerate(spreadsheet['values']):
            if row[0] == row_id:
                return i
        return -1

    def update(cell, v):
        gauth.gsheets_service.spreadsheets().values().update(
            spreadsheetId=spreadsheet_id,
            range=f"Businesses!{cell}",
            valueInputOption="RAW",
            body={"values": [[v]]}
        ).execute()
    
    try:
        spreadsheet = read(spreadsheet_id)
        i = index_of(spreadsheet, row_id)

        if len(contacted):
            update(f'G{i+1}', contacted)

        if len(interested):
            update(f'H{i+1}', interested)

    except HttpError as error:
        print(f"An error occurred: {error}")
        return error
    
def autofit(spreadsheet_id: str, sheet_id: int):
    try:
        gauth.gsheets_service.spreadsheets().batchUpdate(
            spreadsheetId=spreadsheet_id,
            body={
                "requests": [{
                   "autoResizeDimensions": {
                        "dimensions": {
                            "sheetId": sheet_id,
                            "dimension": "COLUMNS",
                            "startIndex": 0,
                            "endIndex": 10
                        }
                    }
                }]
            }
        ).execute()
    except HttpError as error:
        print(f"An error occurred: {error}")
        return error
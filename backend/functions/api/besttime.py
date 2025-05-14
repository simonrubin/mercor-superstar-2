import api.common as common
import json
import os
import requests
import time

BESTTIME_API_KEY = os.environ.get("BESTTIME_API_KEY")
SEARCH_URL = "https://besttime.app/api/v1/venues/search"
JOB_PROGRESS_URL = "https://besttime.app/api/v1/venues/progress"

def search2(q : str):
    def extract_day(forecast, day):

        return {
            'hours': forecast[day]['day_raw'] if len(forecast) > day else [],
            'open': forecast[day]['day_info']['venue_open'] if len(forecast) else -1,
            'close': forecast[day]['day_info']['venue_closed'] if len(forecast) else -1
        }
            
    def extract_score(forecast):
        if len(forecast) == 0:
            return 0
        open_days = list(filter(lambda x : x['day_info']['venue_open'] != 'Closed', forecast))
        return sum(map(lambda x : x['day_info']['day_mean'], open_days)) / len(open_days)

    with open(common.get_path('../json/besttime.json'), 'r') as file:
            data = json.load(file)
            out = []
            for venue in data['venues']:
                forecast = venue.get('venue_foot_traffic_forecast', [])
                out.append({
                            'name': venue['venue_name'],
                            'address': venue['venue_address'],
                            'traffic': {
                                'score': extract_score(forecast),
                                'mon': extract_day(forecast, 0),
                                'tue': extract_day(forecast, 1),
                                'wed': extract_day(forecast, 2),
                                'thu': extract_day(forecast, 3),
                                'fri': extract_day(forecast, 4),
                                'sat': extract_day(forecast, 5),
                                'sun': extract_day(forecast, 6),
                            }
                        })
            return out

def search(q : str):

    def start_search(q : str):
        resp = requests.request("POST", SEARCH_URL, params={
            'api_key_private': BESTTIME_API_KEY,
            'q': q,
            'num': 200,
            'fast': False,
            'format': 'raw'
        }).json()   

        return resp['job_id'], resp['collection_id']
    
    def get_search_progress(job_id : str, col_id : str):
        return requests.request("GET", JOB_PROGRESS_URL, params={
            'job_id': job_id,
            'collection_id': col_id,
            'format': 'raw'
        }).json()
    
    def extract_day(forecast, day):
        return {
            'hours': forecast[day]['day_raw'] if len(forecast) > day else [],
            'open': forecast[day]['day_info']['venue_open'] if len(forecast) else -1,
            'close': forecast[day]['day_info']['venue_closed'] if len(forecast) else -1
        }
                
    def extract_score(forecast):
        if len(forecast) == 0:
            return 0
        open_days = list(filter(lambda x : x['day_info']['venue_open'] != 'Closed', forecast))
        return sum(map(lambda x : x['day_info']['day_mean'], open_days)) / len(open_days)

    job_id, col_id = start_search(q)
    progress = get_search_progress(job_id, col_id)
    while not progress['job_finished']:
        time.sleep(1)
        progress = get_search_progress(job_id, col_id)

    # Results are ready
        
    print("BEST-TIME DONE!!!")
        
    with open(common.get_path('../json/besttime.json'), 'w') as json_file:
        json.dump(progress, json_file)

    data = []
    for venue in progress['venues']:
        forecast = venue.get('venue_foot_traffic_forecast', [])
        data.append({
                    'name': venue['venue_name'],
                    'address': venue['venue_address'],
                    'traffic': {
                        'score': extract_score(forecast),
                        'mon': extract_day(forecast, 0),
                        'tue': extract_day(forecast, 1),
                        'wed': extract_day(forecast, 2),
                        'thu': extract_day(forecast, 3),
                        'fri': extract_day(forecast, 4),
                        'sat': extract_day(forecast, 5),
                        'sun': extract_day(forecast, 6),
                    }  
                })
        
    return data


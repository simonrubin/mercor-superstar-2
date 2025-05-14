import requests
import os
from model.business import Business
import urllib.parse

YELP_API_KEY = os.environ.get("YELP_API_KEY")
YELP_SEARCH_URL = 'https://api.yelp.com/v3/businesses/search?location={}&term={}&categories=&attributes=&sort_by=best_match&limit=50&offset=0'

def search_businesses(location, category):
    headers = {
        "accept": "application/json",
        "Authorization": f"Bearer {YELP_API_KEY}"
    }
    url = YELP_SEARCH_URL.format(urllib.parse.quote(location), urllib.parse.quote(category))
    response = requests.get(url, headers=headers)
    businesses = list(map(lambda x: Business.from_yelp(x), response.json()["businesses"]))

    return businesses
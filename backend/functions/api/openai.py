import api.besttime as besttime
import api.common as common
import api.db as db
import api.gmail as gmail
import api.gsheets as gsheets
import api.yelp as yelp
import json
from openai import OpenAI
import threading
import time
import os
from thefuzz import fuzz

def create_client():
    OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY")
    return OpenAI(api_key=OPENAI_API_KEY)

def create_assistant():
    with open(common.get_path('../json/openai_assistant.json')) as f:
        assistant = json.load(f)
        return client.beta.assistants.create(
            name=assistant['name'],
            instructions='\n'.join(assistant['instructions']),
            tools=assistant['tools'],
            model="gpt-3.5-turbo",
        )

def create_thread():
    return client.beta.threads.create()

def delete_thread(thread_id : str):
    return client.beta.threads.delete(thread_id=thread_id)

def extract_assistant_reply(thread_id):
    messages = client.beta.threads.messages.list(thread_id=thread_id)
    message_dict = json.loads(messages.model_dump_json())
    return message_dict['data'][0]['content'][0]["text"]["value"]

def update_business(thread_id, business_id, contacted='', interested=''):
    spreadsheet_id = db.get_spreadsheet_id(thread_id=thread_id)
    if spreadsheet_id:
        gsheets.update_row(spreadsheet_id, business_id, contacted=contacted, interested=interested)

def submit_tool_output(thread_id, run_id, call_id, output):
    return client.beta.threads.runs.submit_tool_outputs(
        thread_id=thread_id,
        run_id=run_id,
        tool_outputs=[{
            "tool_call_id": call_id,
            "output": json.dumps(output),
        }])

def evaluate_sentiment(msg):
    sys_prompt = """
        Analyze the sentiment of the following outreach email. Determine whether the recipient 
        is interested or uninterested in a follow-up sales call. Respond with your analysis 
        directly in JSON format (without using markdown code blocks or any other formatting). 
        The JSON schema should include: 'interested': string (Yes or No), 'name': string (business name)."
    """

    response = client.chat.completions.create(
        model="gpt-3.5-turbo-1106",
        response_format={ "type": "json_object" },
        messages=[{"role": "system", "content": sys_prompt}, {"role": "user", "content": msg}],
    )

    return json.loads(response.choices[0].message.content)

def fuzzy_match_businesses(business_name, thread_id):
    def fuzz_score(business):
        return fuzz.token_sort_ratio(business_name, business['name'])

    businesses = db.get_businesses(thread_id=thread_id)
    business = max(businesses, key=fuzz_score)
    score = fuzz_score(business)
    return business if score > 80 else None


def fetch_foot_traffic_data(location, category, businesses, thread_id):
    print('Fetching foot traffic data...')
    foot_traffic = besttime.search2(f"{category} in {location}")

    for business in businesses:
        for record in foot_traffic:
            if business['name'] == record['name'] or business['address'] == record['address']:
                business['traffic'] = record['traffic']
                break

    # Attempt to join records by name.
    for business in businesses:
        business['traffic'] = {
            'score': 30,
            'mon': {
                'hours': [0, 0, 0, 85, 85, 60, 55, 70, 35, 15, 5, 10, 30, 20, 40, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                'open': 9,
                'close': 21
            },
            'tue': {
                'hours': [0, 0, 0, 30, 50, 60, 75, 40, 35, 40, 30, 15, 0, 10, 25, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                'open': 9,
                'close': 21
            },
            'wed': {
                'hours': [0, 0, 0, 45, 35, 40, 15, 20, 35, 50, 40, 25, 15, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                'open': 9,
                'close': 21
            },
            'thu': {
                'hours': [0, 0, 0, 35, 85, 90, 100, 45, 20, 0, 0, 0, 0, 0, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                'open': 9,
                'close': 21
            },
            'fri': {
                'hours': [0, 0, 0, 65, 40, 45, 80, 70, 65, 30, 20, 30, 55, 40, 20, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                'open': 9,
                'close': 21
            },
            'sat': {
                'hours': [0, 0, 0, 20, 20, 35, 15, 10, 25, 35, 55, 30, 20, 40, 70, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                'open': 9,
                'close': 21
            },
            'sun': {
                'hours': [0, 0, 0, 0, 5, 15, 40, 55, 65, 35, 15, 5, 15, 30, 15, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                'open': 9,
                'close': 21
            },            
        }
    
    # Update businesses
    db.set_businesses(thread_id=thread_id, businesses=businesses)

# Heuristic: Bottom quartile of businesses by review count and low foot traffic.
def get_top_businesses(thread_id):
    businesses = db.get_businesses(thread_id=thread_id)
    top = sorted(businesses, key=lambda x : x['review_count'])[0:len(businesses)//4]
    top = list(filter(lambda x : 0 < x['traffic'].get('score', 1) < 50, top))
    return top

def run_assistant(thread_id, query):
    client.beta.threads.messages.create(
        thread_id=thread_id,
        role="user",
        content=query
    )
    run = client.beta.threads.runs.create(
        thread_id=thread_id,
        assistant_id=assistant.id,
    )

    data_to_return = {'sessionId': thread_id}

    while run.status == "in_progress" or run.status == "queued":
        time.sleep(1)

        run = client.beta.threads.runs.retrieve(
            thread_id=thread_id,
            run_id=run.id
        )

        if run.status == "completed":
            chat = extract_assistant_reply(thread_id)
            data_to_return['chat'] = chat
            return data_to_return

        if run.status == "requires_action":
            call_id = run.required_action.submit_tool_outputs.tool_calls[0].id
            try:
                client_output, assistant_output = handle_action(run, thread_id, query)
                data_to_return.update(client_output)
                run = submit_tool_output(thread_id, run.id, call_id, assistant_output if assistant_output else client_output)
            except Exception as e:
                print("EXCEPTION!!!!!")
                print(e)
                run = submit_tool_output(thread_id, run.id, call_id, {'error': str(e)})

def handle_action(run, thread_id, query):
    fn = run.required_action.submit_tool_outputs.tool_calls[0]
    args = json.loads(fn.function.arguments)

    client_output = {}
    assistant_output = None

    print(f"Debugging: {fn.function.name}({args})")

    if fn.function.name == "search_businesses":
        location = args['location']
        category = args['category']
        businesses = yelp.search_businesses(location, category)
        db.set_businesses(thread_id=thread_id, businesses=businesses)

        # In a background thread fetch & persist business foot traffic data.
        thread_args = (location, category, businesses, thread_id)
        threading.Thread(target=fetch_foot_traffic_data, args=thread_args, name="foot_traffic").start()

        client_output = {'businesses': businesses}
        assistant_output = {'success': True}
    
    elif fn.function.name == "identify_promising_leads":
        top_businesses = get_top_businesses(thread_id)
        client_output = {'promising': top_businesses}
        assistant_output = {'success': True}
        
    elif fn.function.name == "export_businesses_to_spreadsheet":
        businesses = db.get_businesses(thread_id=thread_id)
        spreadsheet_url = gsheets.create_spreadsheet(args['title'], businesses)
        db.set_spreadsheet_id(thread_id, spreadsheet_url.split('/')[-1])
        
        client_output = {'spreadsheet': {'url': spreadsheet_url, 'title': args['title']}}
        assistant_output = {'success': True}

    elif fn.function.name == "compose_outreach_email":
        business = fuzzy_match_businesses(args['name'], thread_id)

        if not business:
            client_output = {'success': False, 'reason': 'No business found'}

        else:
            db.set_email(business_id=business['id'], message=args['message'], subject=args['subject'])
            client_output = {'email': {'subject': args['subject'], 'body': args['message']}}

    elif fn.function.name == 'get_business_foot_traffic':
        business = fuzzy_match_businesses(args['name'], thread_id)
        if not business:
            client_output = {'success': False, 'reason': 'No business found'}
        else:
            client_output = {'traffic': business['traffic'] if 'traffic' in business else {}}
            assistant_output = {'success': True}


    elif fn.function.name == "send_outreach_email":
        business = fuzzy_match_businesses(args['name'], thread_id)

        if not business:
            client_output = {'success': False, 'reason': 'No business found'}
        else:
            email = db.get_email(business_id=business['id'])
            email_thread_id = gmail.send(email['message'], email['subject'], args['address'])
            db.set_email_recipient(gmail_thread_id=email_thread_id, business_id=business['id'])
            update_business(thread_id, business['id'], contacted='Yes')
            client_output = {'success': True}
            
    elif fn.function.name == "search_inbox_for_response":
        emails = gmail.search_inbox()
        businesses = db.get_businesses(thread_id=thread_id)
        business_ids = set(map(lambda x : x['id'], businesses))
        feedback = []
        feedback_assistant = []
 
        for email in emails:
            eval = evaluate_sentiment(email['content'])  
            business_id = db.get_email_recipient(email['threadId']) 
            
            if business_id in business_ids:
                update_business(thread_id, business_id, interested=eval['interested'])
                business = next(filter(lambda x : x['id'] == business_id, businesses))
                business['interested'] = eval['interested']
                feedback.append(business)
                feedback_assistant.append({'name': business['name'], 'interested': eval['interested']})

                gmail.mark_as_read(email['id'])

        client_output = {'feedback': feedback}
        assistant_output = {'feedback': feedback_assistant}
    
    else:
        raise f'Unknown action: {fn.function.name}'
    
    return client_output, assistant_output

client = create_client()
assistant = create_assistant()

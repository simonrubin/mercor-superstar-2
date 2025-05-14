from model.business import Business

class Context:
    def __init__(self):
        self.businesses = []
        self.location = ''
        self.category = ''
        self.spreadsheet_id = ''
        self.thread_id = None
        self.compose_cmds = []

    def get_business(self, id) -> Business:
        return next(filter(lambda x: x['id'] == id, self.businesses), None)
    
    def get_business_by_name(self, name) -> Business:
        return next(filter(lambda x: x['name'] == name, self.businesses), None)

    def mark_business_interested(self, business_name, interested : bool):
        business = self.get_business_by_name(business_name)
        if business:
            business['interested'] = 'Yes' if interested else 'No'
        return business, self.businesses.index(business)+1
    
    def mark_business_contacted(self, business_id):
        business = self.get_business(business_id)
        business['contacted'] = 'Yes'
        return business, self.businesses.index(business)+1

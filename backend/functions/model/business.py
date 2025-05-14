class Business(dict):

    def __init__(self ,*args,**kwargs):
        dict.__init__(self,*args,**kwargs) 

    @classmethod
    def from_yelp(cls, yelp):
        return cls(
            id=yelp['id'],
            name=yelp['name'],
            star_rating=yelp['rating'],
            review_count=yelp['review_count'],
            phone=yelp['display_phone'],
            address=", ".join(yelp['location']['display_address']),
            longitude=yelp['coordinates']['longitude'],
            latitude=yelp['coordinates']['latitude'],
            thumbnail=yelp['image_url'],
            website=yelp['url'],
            traffic={},
            contacted='',
            interested='',
        )

    def to_list(self):
        return [
            self['id'],
            self['name'],
            self['star_rating'],
            self['review_count'],
            self['phone'],
            self['address'],
            self['contacted'],
            self['interested'],
        ]
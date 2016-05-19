from bs4 import BeautifulSoup
import urllib2
import json
import sentiment
from parse_rest.connection import register
from parse_rest.datatypes import Object

PARSE_APP_ID="7PdlFRkYtj5kmDaJNIQfGKHOVRCajQKVEfRBWB1e"
PARSE_CLIENT_KEY="0r1owyGri3p7uyo7UX5kivlkhJshtH169KWHGLqk"

register(PARSE_APP_ID, PARSE_CLIENT_KEY, master_key="8dHrxPljlhjB2QJuV0YGrY5tUh7MptdDYnJ3sg6a")

class Twit(Object):
    pass

def get_save_Twits():
	#url for StockTwits
	url = "http://stocktwits.com/symbol/AAPL?q=%24AAPL"

	content = urllib2.urlopen(url).read()
	soup = BeautifulSoup(content, "lxml")
	ol = soup.find("ol", {"class": "stream-list show-conversation stream-poller"}).find_all(attrs={"data-src": True})
	

	#Acquiring and saving Twits
	d = {}
	for i in ol:
		d = json.loads(i["data-src"].encode('ascii', 'ignore').decode('ascii'))

		#Twit attributes
		twitID = d["id"]
		twitBody = d["body"]
		sentimentTwit = ""
		liked = d["liked"]
		total_likes = d["total_likes"]
		username = d["user"]["username"]

		if (d["sentiment"] != None):
			sentimentTwit = d["sentiment"]["name"]

		print("\n\nReceived Twit {}: {}".format(twitID, twitBody))
		print(sentimentTwit)
		polarity = sentiment.classify(twitBody)
		
		twit = Twit(liked = liked,
			total_likes = total_likes,
			twitID = twitID,
			sentiment = sentimentTwit,
			messageText = twitBody,
			username = username,
			Polarity = polarity)
		try:
			twit.save()
			print("Saved twit object ({})".format(twit.objectId))
		except:
			print("Twit has already been saved.")

get_save_Twits()
from __future__ import division
import simplejson
from textblob import TextBlob
# http://textblob.readthedocs.org/en/dev/api_reference.html#textblob.blob.TextBlob.sentiment

# http://planspace.org/20150607-textblob_sentiment/

def classify(text):
    classification = 0
    blob = TextBlob(text)
    
    polarity = 0

    for sentence in blob.sentences:
        polarity += sentence.sentiment.polarity
        
    polarity = polarity / len(blob.sentences)

    print("Polarity:{}".format(polarity))

    return polarity
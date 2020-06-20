import json
from newspaper import Article
from newspaper import fulltext
import requests
import spacy
import nltk
import re
from bs4 import BeautifulSoup
# from bs4.dammit import EncodingDetector
from multiprocessing.dummy import Pool as ThreadPool 
import numpy as np
import datetime
nltk.download('punkt')



def textAnalysis(url, ipfrm):

    status = 'success'
    message = 'successfully processed'
    returnObj = {}
    title = ''
    publish_date = ''
    authors = ''
    keywords = ''
    summary = ''
    
    try:
        if ipfrm == 'box':
            returnObj['navigation'] = getArctileUrls(url)
        a = Article(url, language='en')
        html = requests.get(url).text
        text = fulltext(html)
        download = a.download()
        parse = a.parse()
        nlp = a.nlp()
        title = a.title
        publish_date = a.publish_date
        authors = a.authors
        keywords = a.keywords
        summary = a.summary
        image = a.top_image
        returnObj['title'] = title
        if publish_date:
            publish_date = datetime.datetime.strptime(str(publish_date), '%Y-%m-%d %H:%M:%S')
        returnObj['publish_date'] = publish_date 
        if len(authors)>3:
            authors = authors[:3]
        authors = ', '.join(authors).strip()
        returnObj['authors'] = authors    
        returnObj['keywords'] = keywords
        returnObj['summary'] = summary
        returnObj['image'] = image
        returnObj['spacyResult'] = spciySent(text)
        returnObj['toneAnaysis'] = toneAnaysis(text)
    
    except Exception as e:
        status = 'failure'
        message = str(e)
    
    return {'status':status, 'message':message, 'result':returnObj} 



def spciySent(txt):

    spacyObj = {}
    try:
        nlp = spacy.load("en_core_web_sm")
        doc = nlp(txt)
        noun_chunks = list(doc.noun_chunks)
        sentences = list(doc.sents)
        print(sentences)
        tmpNouns = []
        nouns = []
        for chunk in doc.noun_chunks:
            if str(chunk.text) not in tmpNouns:
                nouns.append(chunk.text)
                tmpNouns.append(str(chunk.text))
        nerList = []
        nerDup = [] 
        for entity in doc.ents:
            print(entity.text,'----', entity.label_)
            if entity.text not in nerDup:
                nerList.append({entity.text:entity.label_})
                nerDup.append(entity.text)

        spacyObj['nerList'] = nerList
        spacyObj['Nouns']   = nouns
    except Exception as e:
        pass
    return spacyObj



def toneAnaysis(summary):
    try:
        sentUrl = 'https://apis.sentient.io/microservices/utility/IBMSA/v1.0/getresults'
        headersSent = {'Content-Type': 'application/json', 'x-api-key':'40DA0290615043F8BB73'}
        data = {"key":summary}
        resp = requests.post(sentUrl, headers=headersSent, data=json.dumps(data))
        sentimentRes = json.loads(resp.content.decode('utf-8'))
        return sentimentRes
    except Exception as e:
        return {}

def checkvalid(url):
    try:
        cont = requests.get(url)
        soup = BeautifulSoup(cont.content, 'lxml')
        title = soup.title
        title = title.string
        return {"title":title, "url":url}
    except Exception as e:
        pass


def getArctileUrls(url):

    resp = requests.get(url)
    domainName = re.search(r'^http[s]*:\/\/[\w\.]*', url).group()
    soup = BeautifulSoup(resp.content, 'lxml')
    relatedNewsLinks = []
    noDuplicate = []
    navList = []
    count = 0
    for link in soup.find_all('a', href=True):
        if 'login' not in link['href'] and 'signup' not in link['href']:
            if (domainName in link['href']) and (link['href'] not in noDuplicate) and (count<11):
                relatedNewsLinks.append(link['href'])
                noDuplicate.append(link['href'])
                count += 1
    print('+++++++++++++++++++++++++++++++++++')
    print(relatedNewsLinks)
    print('+++++++++++++++++++++++++++++++++++')
    if relatedNewsLinks:
        pool = ThreadPool(5)
        navList = pool.map(checkvalid, relatedNewsLinks)
        pool.close()
        pool.join()
    navList = [nav for nav in navList if nav]
    return navList

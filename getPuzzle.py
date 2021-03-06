import requests
import json
import csv
from datetime import datetime, timedelta
import os
from dotenv import load_dotenv
from progress.bar import ShadyBar

load_dotenv()

key= os.getenv('key')




statsUrl='https://nyt-games-prd.appspot.com/svc/crosswords/v6/game/{}.json'
dailyUrl='https://nyt-games-prd.appspot.com/svc/crosswords/v2/puzzle/daily-{}.json'
cookies={"NYT-S": key}


#Get date's puzzle info (does not include stats)
def getDailyPuzzle(date):
    url=dailyUrl.format(formatDate(date))
    x = requests.get(url,cookies=cookies);

    return json.loads(x.text)["results"][0]

#Get stats for puzzle
def getDailyStats(puzzleId):
    url=statsUrl.format(puzzleId)
    res = requests.get(url,cookies=cookies);
    x=json.loads(res.text)
    if("solved" in x["calcs"]):
        x["hasStats"]=True;
    else:
        x["hasStats"]=False;


    return x

#Get puzzles stored in xword.json
def getSavedPuzzles():
    with open("xword.json", 'r') as f:
        data = json.load(f)
    return data

#Format date to work with get requests
def formatDate(date):
    return date.strftime("%Y-%m-%d")

#Save data to xword.json
def savePuzzleJSON(data):
    with open('xword.json', mode='w') as f:
        json.dump(data, f, indent=4)

#Get daily puzzle with stats
def getPuzzleData(date):
    puzzleData=getDailyPuzzle(date)
    puzzleID=puzzleData["puzzle_id"]
    puzzleData.update(getDailyStats(puzzleID))
    return puzzleData

#Get range of puzzles and put in dict with date as key
def getPuzzleRange(startDate,endDate):
    date=startDate
    data={}
    bar = ShadyBar('Getting Crossword Data: ', max=(endDate-startDate).days)
    while(date<=endDate):
        #print("Getting Puzzle For "+formatDate(date))
        data[formatDate(date)]=getPuzzleData(date)
        date=date+timedelta(days=1)
        bar.next()
    return data


if __name__=="__main__":
    puzzleData=getSavedPuzzles()
    startDate=datetime.strptime("2020-1-1","%Y-%m-%d")
    endDate=datetime.strptime("2021-1-12","%Y-%m-%d")
    puzzleData.update(getPuzzleRange(startDate,endDate))
    savePuzzleJSON(puzzleData)

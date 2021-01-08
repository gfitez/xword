$( document ).ready(function() {
  loadXWordData()
});

//getData from xword.json
xWordData=null;
function loadXWordData(){
  var rawFile = new XMLHttpRequest();
  rawFile.open("GET", "xword.json", false);
  rawFile.onreadystatechange = function (){
    if(rawFile.readyState === 4 && (rawFile.status === 200 || rawFile.status == 0)){
      console.log(JSON.parse(rawFile.responseText))
      xWordData=JSON.parse(rawFile.responseText)
      dataReady()
      updateHTML()

    }
  }
  rawFile.send(null);
}
stats={
  "totalStarted":0,
  "totalSolved":0,
  "solvePercent":0,
  "dailySolved":[0,0,0,0,0,0,0],
  "solveTimes":[],
  "averageSolveTime":0,
  "dailySolveTimes":[[],[],[],[],[],[],[]],
  "dailyAverageSolveTimes":[0,0,0,0,0,0,0],
  "solvingPercentOfDay":[],
  "dailySolvingPercentageOfDay":[[],[],[],[],[],[],[]],
  "first":"",
  "firstDate":Infinity,
  "mostRecent":"",
  "mostRecentDate":-Infinity,
  "fastest":"",
  "fastestTime":Infinity,
  "slowest":"",
  "slowestTime":-Infinity,
  "totalSolveTime":0,
  "averageTimeOfDay":0,
  "bestDay":0,
  "squaresFilled":0,
  "clueCount":0,
}

//get number of seconds since midnight
function secondsOfDay(date){
  return date.getSeconds() + (60 * date.getMinutes()) + (60 * 60 * date.getHours());
}

//populate stats
function dataReady(){


  //loop through each crossword
  for(key of Object.keys(xWordData)){
    var puzzle=xWordData[key]
    var dayOFWeek=(new Date(puzzle["puzzle_meta"]["printDate"])).getDay()

    if(puzzle["hasStats"]){stats["totalStarted"]+=1;}
    if(puzzle["calcs"] && puzzle["calcs"]["solved"]){
      stats["totalSolved"]++;
      stats["dailySolved"][dayOFWeek]++;

      solveTime=parseInt(puzzle["calcs"]["secondsSpentSolving"])
      stats["solveTimes"].push(solveTime)
      stats["dailySolveTimes"][dayOFWeek].push(solveTime)
      stats["dailyAverageSolveTimes"][dayOFWeek]+=(solveTime)
      stats["averageSolveTime"]+=(solveTime)
      stats["totalSolveTime"]+=(solveTime)


      //slowest and fastest time
      if(solveTime<stats["fastestTime"]){
        stats["fastestTime"]=solveTime;
        stats["fastest"]=key
      }
      if(solveTime>stats["slowestTime"]){
        stats["slowestTime"]=solveTime;
        stats["slowest"]=key
      }


      //most recent and first
      var completedDate=puzzle["firsts"]["solved"]
      if(completedDate>stats["mostRecentDate"]){
        stats["mostRecentDate"]=completedDate
        stats["mostRecent"]=key
      }
      if(completedDate<stats["firstDate"]){
        stats["firstDate"]=completedDate;
        stats["first"]=key
      }


      //squares filled
      for(var i=0;i<puzzle["puzzle_data"]["answers"].length;i++){
        if(puzzle["puzzle_data"]["answers"][i]!=null){
          stats["squaresFilled"]++;
        }
      }

      stats["clueCount"]+=puzzle["puzzle_data"]["clues"]["A"].length
      stats["clueCount"]+=puzzle["puzzle_data"]["clues"]["D"].length
    }


  }

  //get best day
  stats["bestDay"]=[]
  max=0
  for(var i=0;i<stats["dailySolved"].length;i++){
    if(stats["dailySolved"][i]==max){
      stats["bestDay"].push(i)
    }
    if(stats["dailySolved"][i]>max){
      stats["bestDay"]=[i];
      max=stats["dailySolved"][i]
    }
  }


  //divide for averageSolveTime
  stats["averageSolveTime"]/=stats["totalSolved"]
  for(var i=0;i<stats["dailySolveTimes"].length;i++){
    stats["dailyAverageSolveTimes"][i]/=stats["dailySolved"][i]
  }


  //-----------------------------------------------------------------------------
  //of the days where a crossword was completed, what hours were they  on

  //spacing between points to check when crossword was completed (in secs)
  var increment=60*60
  var entryCount=0//keep track of how many sections crosswodr was being done in order to divide for weighted average to calculated average time of day.
  for(var i=0;i<24*60*60;i+=increment){
    stats["solvingPercentOfDay"].push(0)
    for(var j=0;j<7;j++){
      stats["dailySolvingPercentageOfDay"][j].push(0)
    }
    //add up all crosswords being completed during this time
    for(key of Object.keys(xWordData)){
      var puzzle=xWordData[key]
      var dayOfWeek=(new Date(puzzle["puzzle_meta"]["printDate"])).getDay()
      if(puzzle["calcs"] && puzzle["calcs"]["solved"]){
        start=new Date(puzzle["firsts"]["opened"]*1000)
        end=new Date(puzzle["firsts"]["solved"]*1000)
        startSecs=secondsOfDay(start)
        endSecs=secondsOfDay(end)

        if(i>=startSecs && i<=endSecs){
          stats["solvingPercentOfDay"][stats["solvingPercentOfDay"].length-1]+=1
          stats["dailySolvingPercentageOfDay"][dayOfWeek][stats["dailySolvingPercentageOfDay"][dayOfWeek].length-1]+=1
          entryCount+=1;
          stats["averageTimeOfDay"]+=i
        }


      }
    }
    //divide by total completed to get percentage
    stats["solvingPercentOfDay"][stats["solvingPercentOfDay"].length-1]/=stats["totalSolved"]
    for(var j=0;j<7;j++){
      stats["dailySolvingPercentageOfDay"][j][stats["dailySolvingPercentageOfDay"][j].length-1]/=stats["dailySolved"][j]
    }
  }
  stats["averageTimeOfDay"]/=entryCount

  //-----------------------------------------------------------------------------
  stats["solvePercent"]=stats["totalStarted"]/stats["totalSolved"]
  //--------------------------------------------------------------


  console.log(stats)
}
function dayOfWeek(n){
  return ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"][n]
}
function formatSeconds(n){
  string=""
  started=false;
  if(n>=24*60*60){
    string+=Math.floor(n/(24*60*60))+" day "
    n%=24*60*60
    started=true;
  }
  if(n>=60*60 || started){
    string+=Math.floor(n/(60*60))+" hours "
    n%=60*60
  }
  if(n>=60 || started){
    string+=Math.floor(n/60)+" minutes "
    n%=60
  }
  string+=Math.floor(n)+" seconds"
  return string
}
function formatTime(n){
  string=""

  string+=Math.floor((n%(12*60*60))/(60*60))+":"
  n%=(60*60)
  string+=Math.floor(n/60)
  n^=60

  if(n>=12*60*60)string+="PM"
  else string+="AM"
  return string
}
function formatArray(arr){
  if(arr.length==0)return ""
  if(arr.length==1){
    return arr[0];
  }
  if(arr.length==2){
    return arr[0]+" and "+arr[1]
  }
  string=""
  for(i=0;i<arr.length-1;i++){
    string+=arr[i]+", "
  }
  string+="and "+arr[arr.length-1]
  return string
}
function formatDayList(arr){
  out=[]
  for(var i=0;i< arr.length;i++){
    out[i]=dayOfWeek(arr[i])
  }

  return formatArray(out)
}

function reformatDate(date){
  date=new Date(date)
  return dayOfWeek(date.getDay())+" "+(date.getMonth()+1)+"/"+date.getDate()+"/"+date.getFullYear()
}
function updateHTML(){
  $("#attempted").html(stats["totalStarted"])
  $("#solved").html(stats["totalSolved"])
  $("#solveRate").html(stats["solvePercent"]*100+"%")
  $("#firstPuzzle").html(reformatDate(stats["first"]))
  $("#timeSpent").html(formatSeconds(stats["totalSolveTime"]))
  $("#averageTimeOfDay").html(formatTime(stats["averageTimeOfDay"]))
  $("#fastestTime").html(formatSeconds(stats["fastestTime"]))
  $("#fastestTimeDay").html(reformatDate(stats["fastest"]))
  $("#slowestTime").html(formatSeconds(stats["slowestTime"]))
  $("#slowestTimeDay").html(reformatDate(stats["slowest"]))
  $("#mostRecent").html(reformatDate(stats["mostRecent"]))
  $("#favoriteDay").html(formatDayList(stats["bestDay"]))
  $("#favoriteDayCount").html(Math.max.apply(null,stats["dailySolved"]))
  $("#cluesAnswered").html(stats["clueCount"])
  $("#squaresFilled").html(stats["squaresFilled"])
}
